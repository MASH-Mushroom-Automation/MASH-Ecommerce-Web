/**
 * StarRatingInput Component Unit Tests
 *
 * Tests interactive star rating selector:
 * - Initial rendering with value
 * - Click to select rating
 * - Hover preview display
 * - Keyboard navigation (ArrowLeft/Right)
 * - Disabled state
 * - Rating labels display
 * - Accessibility
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRatingInput } from "../StarRatingInput";

describe("StarRatingInput", () => {
  const defaultProps = {
    value: 0,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== Rendering =====

  it("renders 5 star buttons", () => {
    render(<StarRatingInput {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("renders with default label", () => {
    render(<StarRatingInput {...defaultProps} />);
    expect(screen.getByText("Your Rating")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<StarRatingInput {...defaultProps} label="Rate this grower" />);
    expect(screen.getByText("Rate this grower")).toBeInTheDocument();
  });

  it("renders without label when empty string", () => {
    render(<StarRatingInput {...defaultProps} label="" />);
    expect(screen.queryByText("Your Rating")).not.toBeInTheDocument();
  });

  // ===== Star Selection =====

  it("calls onChange with correct value when star is clicked", async () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={0} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[2]); // 3rd star

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange with 1 when first star clicked", async () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={0} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("calls onChange with 5 when last star clicked", async () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={0} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[4]);

    expect(onChange).toHaveBeenCalledWith(5);
  });

  // ===== Rating Labels =====

  it("displays 'Poor' label for rating 1", () => {
    render(<StarRatingInput value={1} onChange={jest.fn()} />);
    expect(screen.getByText("Poor")).toBeInTheDocument();
  });

  it("displays 'Fair' label for rating 2", () => {
    render(<StarRatingInput value={2} onChange={jest.fn()} />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
  });

  it("displays 'Good' label for rating 3", () => {
    render(<StarRatingInput value={3} onChange={jest.fn()} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("displays 'Very Good' label for rating 4", () => {
    render(<StarRatingInput value={4} onChange={jest.fn()} />);
    expect(screen.getByText("Very Good")).toBeInTheDocument();
  });

  it("displays 'Excellent' label for rating 5", () => {
    render(<StarRatingInput value={5} onChange={jest.fn()} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("does not display label when value is 0", () => {
    render(<StarRatingInput value={0} onChange={jest.fn()} />);
    expect(screen.queryByText("Poor")).not.toBeInTheDocument();
    expect(screen.queryByText("Fair")).not.toBeInTheDocument();
    expect(screen.queryByText("Good")).not.toBeInTheDocument();
    expect(screen.queryByText("Very Good")).not.toBeInTheDocument();
    expect(screen.queryByText("Excellent")).not.toBeInTheDocument();
  });

  // ===== Disabled State =====

  it("does not call onChange when disabled", async () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={0} onChange={onChange} disabled />);

    const buttons = screen.getAllByRole("button");
    // Click is blocked by disabled attribute
    await userEvent.click(buttons[2]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows cursor-not-allowed style when disabled", () => {
    render(<StarRatingInput value={0} onChange={jest.fn()} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button.className).toContain("cursor-not-allowed");
    });
  });

  // ===== Accessibility =====

  it("has correct aria-labels", () => {
    render(<StarRatingInput {...defaultProps} />);
    expect(
      screen.getByLabelText("Rate 1 out of 5 stars"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Rate 3 out of 5 stars"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Rate 5 out of 5 stars"),
    ).toBeInTheDocument();
  });

  // ===== Keyboard Navigation =====

  it("handles ArrowRight keyboard navigation", () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={3} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.keyDown(buttons[2], { key: "ArrowRight" });

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("handles ArrowLeft keyboard navigation", () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={3} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.keyDown(buttons[2], { key: "ArrowLeft" });

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("does not go below 1 with ArrowLeft on first star", () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={1} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.keyDown(buttons[0], { key: "ArrowLeft" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not go above 5 with ArrowRight on last star", () => {
    const onChange = jest.fn();
    render(<StarRatingInput value={5} onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.keyDown(buttons[4], { key: "ArrowRight" });

    expect(onChange).not.toHaveBeenCalled();
  });

  // ===== Hover Preview =====

  it("shows hover preview on mouseEnter", () => {
    render(<StarRatingInput value={0} onChange={jest.fn()} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.mouseEnter(buttons[3]); // Hovering 4th star

    // Should show "Very Good" label from hover state
    expect(screen.getByText("Very Good")).toBeInTheDocument();
  });

  it("clears hover preview on mouseLeave", () => {
    render(<StarRatingInput value={0} onChange={jest.fn()} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.mouseEnter(buttons[3]);
    expect(screen.getByText("Very Good")).toBeInTheDocument();

    fireEvent.mouseLeave(buttons[3]);
    // Should not show any label when value is 0 and no hover
    expect(screen.queryByText("Very Good")).not.toBeInTheDocument();
  });
});
