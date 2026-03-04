import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the base chart module
jest.mock("@/components/ui/chart", () => {
  const React = require("react");
  return {
    ChartTooltip: (props: any) => {
      // Render the content function if provided
      const content = props.content
        ? props.content({ active: true, payload: [{ value: 10 }] })
        : null;
      return <div data-testid="base-tooltip">{content}</div>;
    },
    ChartTooltipContent: (props: any) => (
      <div data-testid="base-tooltip-content" data-active={String(props.active)}>
        {props.hideLabel ? null : <span>label</span>}
      </div>
    ),
  };
});

import { ChartTooltipContent, ChartTooltip } from "../chart-tooltip";

describe("ChartTooltipContent", () => {
  it("should return null when not active", () => {
    const { container } = render(
      <ChartTooltipContent active={false} payload={[]} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("should return null when payload is empty", () => {
    const { container } = render(
      <ChartTooltipContent active={true} payload={[]} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("should render content when active with payload", () => {
    render(
      <ChartTooltipContent
        active={true}
        payload={[{ value: 100 }]}
      />
    );
    expect(screen.getByTestId("base-tooltip-content")).toBeInTheDocument();
  });

  it("should pass hideLabel to base component", () => {
    render(
      <ChartTooltipContent
        active={true}
        payload={[{ value: 100 }]}
        hideLabel
      />
    );
    expect(screen.queryByText("label")).not.toBeInTheDocument();
  });
});

describe("ChartTooltip", () => {
  it("should render with default props", () => {
    render(<ChartTooltip />);
    expect(screen.getByTestId("base-tooltip")).toBeInTheDocument();
  });

  it("should render with hideLabel prop", () => {
    render(<ChartTooltip hideLabel />);
    expect(screen.getByTestId("base-tooltip")).toBeInTheDocument();
  });
});
