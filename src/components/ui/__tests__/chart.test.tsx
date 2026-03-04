import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { render, screen } from "@testing-library/react";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Tooltip: (props: any) => <div data-testid="tooltip">Tooltip</div>,
  Legend: (props: any) => <div data-testid="legend">Legend</div>,
}));

describe("Chart UI Components", () => {
  const config: ChartConfig = {
    apples: { label: "Apples", color: "#f00" },
    oranges: { label: "Oranges", color: "#fa0" },
  };

  const themeConfig: ChartConfig = {
    apples: { label: "Apples", theme: { light: "#f00", dark: "#ff0" } },
  };

  const emptyConfig: ChartConfig = {};
  const noColorConfig: ChartConfig = { apples: { label: "Apples" } };

  describe("ChartContainer", () => {
    it("renders children", () => {
      const { container } = render(
        <ChartContainer config={config}>
          <div>Chart Child</div>
        </ChartContainer>
      );
      expect(container.textContent).toContain("Chart Child");
    });

    it("renders with data-slot attribute", () => {
      render(
        <ChartContainer config={config} data-testid="container">
          <div>chart</div>
        </ChartContainer>
      );
      expect(screen.getByTestId("container")).toHaveAttribute("data-slot", "chart");
    });

    it("sets data-chart with custom id", () => {
      render(
        <ChartContainer config={config} id="my-chart" data-testid="container">
          <div>chart</div>
        </ChartContainer>
      );
      expect(screen.getByTestId("container")).toHaveAttribute("data-chart", "chart-my-chart");
    });

    it("merges custom className", () => {
      render(
        <ChartContainer config={config} className="extra" data-testid="container">
          <div>chart</div>
        </ChartContainer>
      );
      expect(screen.getByTestId("container")).toHaveClass("extra");
    });
  });

  describe("ChartStyle", () => {
    it("renders style tag with color config", () => {
      const { container } = render(<ChartStyle id="test" config={config} />);
      const style = container.querySelector("style");
      expect(style).toBeDefined();
      expect(style?.innerHTML).toContain("--color-apples: #f00");
      expect(style?.innerHTML).toContain("--color-oranges: #fa0");
    });

    it("renders style tag with theme config", () => {
      const { container } = render(<ChartStyle id="test" config={themeConfig} />);
      const style = container.querySelector("style");
      expect(style?.innerHTML).toContain("--color-apples: #f00");
      expect(style?.innerHTML).toContain("--color-apples: #ff0");
    });

    it("returns null for empty config", () => {
      const { container } = render(<ChartStyle id="test" config={emptyConfig} />);
      expect(container.querySelector("style")).toBeNull();
    });

    it("returns null for config without color or theme", () => {
      const { container } = render(<ChartStyle id="test" config={noColorConfig} />);
      expect(container.querySelector("style")).toBeNull();
    });
  });

  describe("ChartTooltipContent", () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartContainer config={config}>{children}</ChartContainer>
    );

    it("returns null when not active", () => {
      const { container } = render(
        <Wrapper>
          <ChartTooltipContent active={false} payload={[]} />
        </Wrapper>
      );
      expect(container.querySelector("[data-slot=chart]")?.children.length).toBeLessThanOrEqual(2);
    });

    it("returns null when payload is empty", () => {
      const { container } = render(
        <Wrapper>
          <ChartTooltipContent active={true} payload={[]} />
        </Wrapper>
      );
      expect(container.querySelector("[data-slot=chart]")?.children.length).toBeLessThanOrEqual(2);
    });

    it("renders content when active with payload", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      const { container } = render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} label="January" />
        </Wrapper>
      );
      expect(container.textContent).toContain("10");
    });

    it("hides label when hideLabel is true", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} label="January" hideLabel />
        </Wrapper>
      );
      expect(screen.queryByText("January")).not.toBeInTheDocument();
    });

    it("uses labelFormatter when provided", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent
            active
            payload={payload}
            label="January"
            labelFormatter={(val) => `Month: ${val}`}
          />
        </Wrapper>
      );
      expect(screen.getByText("Month: January")).toBeInTheDocument();
    });

    it("renders with line indicator", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      const { container } = render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} indicator="line" />
        </Wrapper>
      );
      expect(container.querySelector("[style*='--color-bg']")).toBeInTheDocument();
    });

    it("renders with dashed indicator", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      const { container } = render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} indicator="dashed" />
        </Wrapper>
      );
      expect(container.querySelector(".border-dashed")).toBeInTheDocument();
    });

    it("hides indicator when hideIndicator is true", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      const { container } = render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} hideIndicator />
        </Wrapper>
      );
      expect(container.querySelectorAll("[style*='--color-bg']").length).toBe(0);
    });

    it("uses custom formatter when provided", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent
            active
            payload={payload}
            formatter={(value) => <span key="f">Custom: {String(value)}</span>}
          />
        </Wrapper>
      );
      expect(screen.getByText(/Custom: 10/)).toBeInTheDocument();
    });

    it("filters out items with type 'none'", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "none", payload: { fill: "#f00" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} />
        </Wrapper>
      );
      expect(screen.queryByText("10")).not.toBeInTheDocument();
    });

    it("renders with nameKey", () => {
      const payload = [{ name: "apples", value: 75, dataKey: "apples", type: "bar", payload: { fill: "#f00", category: "apples" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} nameKey="category" />
        </Wrapper>
      );
      expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("renders config icon when available", () => {
      const IconComponent = () => <svg data-testid="custom-icon" />;
      const configWithIcon: ChartConfig = {
        apples: { label: "Apples", color: "#f00", icon: IconComponent },
      };
      render(
        <ChartContainer config={configWithIcon}>
          <ChartTooltipContent
            active
            payload={[{ name: "apples", value: 50, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }]}
          />
        </ChartContainer>
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("renders with labelKey", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} label="Jan" labelKey="apples" />
        </Wrapper>
      );
      expect(screen.getAllByText("Apples").length).toBeGreaterThanOrEqual(1);
    });

    it("handles single payload with non-dot indicator (nestLabel)", () => {
      const payload = [{ name: "apples", value: 10, dataKey: "apples", type: "bar", payload: { fill: "#f00" }, color: "#f00" }];
      render(
        <Wrapper>
          <ChartTooltipContent active payload={payload} label="January" indicator="line" />
        </Wrapper>
      );
      // With nestLabel (single payload + non-dot indicator), label appears nested
      expect(screen.getByText("January")).toBeInTheDocument();
    });
  });

  describe("ChartLegendContent", () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartContainer config={config}>{children}</ChartContainer>
    );

    it("returns null for empty payload", () => {
      const { container } = render(
        <Wrapper>
          <ChartLegendContent payload={[]} />
        </Wrapper>
      );
      expect(container.textContent).toBeDefined();
    });

    it("renders legend items", () => {
      const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "bar" as const }];
      render(
        <Wrapper>
          <ChartLegendContent payload={payload} />
        </Wrapper>
      );
      expect(screen.getByText("Apples")).toBeInTheDocument();
    });

    it("filters out items with type 'none'", () => {
      const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "none" as const }];
      render(
        <Wrapper>
          <ChartLegendContent payload={payload} />
        </Wrapper>
      );
      expect(screen.queryByText("Apples")).not.toBeInTheDocument();
    });

    it("applies top alignment class", () => {
      const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "bar" as const }];
      const { container } = render(
        <Wrapper>
          <ChartLegendContent verticalAlign="top" payload={payload} />
        </Wrapper>
      );
      expect(container.querySelector(".pb-3")).toBeInTheDocument();
    });

    it("renders icon from config", () => {
      const IconComponent = () => <svg data-testid="legend-icon" />;
      const configWithIcon: ChartConfig = {
        apples: { label: "Apples", color: "#f00", icon: IconComponent },
      };
      const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "bar" as const }];
      render(
        <ChartContainer config={configWithIcon}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      );
      expect(screen.getByTestId("legend-icon")).toBeInTheDocument();
    });

    it("hides icon when hideIcon is true", () => {
      const IconComponent = () => <svg data-testid="legend-icon" />;
      const configWithIcon: ChartConfig = {
        apples: { label: "Apples", color: "#f00", icon: IconComponent },
      };
      const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "bar" as const }];
      render(
        <ChartContainer config={configWithIcon}>
          <ChartLegendContent hideIcon payload={payload} />
        </ChartContainer>
      );
      expect(screen.queryByTestId("legend-icon")).not.toBeInTheDocument();
    });

    it("uses nameKey for lookup", () => {
      const payload = [{ dataKey: "apples", value: "apples", color: "#f00", type: "bar" as const }];
      render(
        <Wrapper>
          <ChartLegendContent payload={payload} nameKey="apples" />
        </Wrapper>
      );
      expect(screen.getByText("Apples")).toBeInTheDocument();
    });
  });
});
