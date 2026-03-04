import React from "react";
import { render, screen } from "@testing-library/react";

// Mock react-day-picker
jest.mock("react-day-picker", () => {
  const React = require("react");
  return {
    DayPicker: function MockDayPicker(props: any) {
      // Exercise the Root component if provided
      const RootComp = props.components?.Root || "div";
      const ChevronComp = props.components?.Chevron;

      // Exercise formatters
      const formatted = props.formatters?.formatMonthDropdown?.(new Date(2024, 0, 1));

      return (
        <RootComp className={props.className} rootRef={React.createRef()}>
          <div data-testid="day-picker" data-show-outside={String(props.showOutsideDays)} data-caption={props.captionLayout}>
            {formatted && <span data-testid="formatted-month">{formatted}</span>}
            {ChevronComp && (
              <>
                <ChevronComp orientation="left" />
                <ChevronComp orientation="right" />
                <ChevronComp orientation="down" />
              </>
            )}
          </div>
        </RootComp>
      );
    },
    DayButton: (props: any) => <button {...props} />,
    getDefaultClassNames: () => ({
      root: "", months: "", month: "", nav: "",
      button_previous: "", button_next: "", month_caption: "",
      dropdowns: "", dropdown_root: "", dropdown: "",
      caption_label: "", weekdays: "", weekday: "", week: "",
      week_number_header: "", week_number: "", day: "",
      range_start: "", range_middle: "", range_end: "",
      today: "", outside: "", disabled: "", hidden: "",
    }),
  };
});

import { Calendar } from "../calendar";

describe("Calendar", () => {
  it("should render with data-slot attribute", () => {
    const { container } = render(<Calendar />);
    expect(container.querySelector("[data-slot='calendar']")).toBeInTheDocument();
  });

  it("should show outside days by default", () => {
    render(<Calendar />);
    expect(screen.getByTestId("day-picker")).toHaveAttribute("data-show-outside", "true");
  });

  it("should render with custom className", () => {
    const { container } = render(<Calendar className="my-cal" />);
    const root = container.querySelector("[data-slot='calendar']");
    expect(root?.className).toContain("my-cal");
  });

  it("should render chevron components for left and right", () => {
    const { container } = render(<Calendar />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("should format month dropdown to short format", () => {
    render(<Calendar />);
    const formatted = screen.getByTestId("formatted-month");
    expect(formatted.textContent).toBe("Jan");
  });

  it("should accept dropdown captionLayout", () => {
    render(<Calendar captionLayout="dropdown" />);
    expect(screen.getByTestId("day-picker")).toHaveAttribute("data-caption", "dropdown");
  });

  it("should accept custom buttonVariant", () => {
    render(<Calendar buttonVariant="outline" />);
    expect(screen.getByTestId("day-picker")).toBeInTheDocument();
  });
});
