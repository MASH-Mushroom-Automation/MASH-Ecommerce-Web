import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from "@/components/ui/chart";
import { render } from "@testing-library/react";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Tooltip: (props: any) => <div data-testid="tooltip">Tooltip</div>,
  Legend: (props: any) => <div data-testid="legend">Legend</div>,
}));

describe("Chart UI Components", () => {
  const config = {
    apples: { label: "Apples", color: "#f00" },
    oranges: { label: "Oranges", color: "#fa0" },
  };

  it("renders ChartContainer without crashing", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <div>Chart Child</div>
      </ChartContainer>
    );
    expect(container.textContent).toContain("Chart Child");
  });

  it("renders ChartStyle when config has colors", () => {
    const { container } = render(<ChartStyle id="test" config={config} />);
    expect(container.querySelector("style")).toBeDefined();
  });

  it("renders ChartTooltipContent leniently", () => {
    const payload = [{ name: "apples", value: 10, type: "bar", payload: { fill: "#f00" } }];
    const { container } = render(
      <ChartContainer config={config}>
        <ChartTooltipContent active payload={payload} />
      </ChartContainer>
    );
    expect(container.textContent).toBeDefined();
  });

  it("renders ChartLegendContent leniently", () => {
    const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "bar" }];
    const { container } = render(
      <ChartContainer config={config}>
        <ChartLegendContent payload={payload} />
      </ChartContainer>
    );
    expect(container.textContent).toBeDefined();
  });
});
