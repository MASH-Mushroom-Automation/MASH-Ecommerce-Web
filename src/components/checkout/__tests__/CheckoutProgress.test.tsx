/**
 * CheckoutProgress Component Tests
 * Tests the step indicator/progress bar for the checkout flow.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { CheckoutProgress } from "../CheckoutProgress";

describe("CheckoutProgress", () => {
  it("renders step 1 heading correctly", () => {
    render(<CheckoutProgress currentStep={1} />);
    expect(screen.getByText("Delivery Method")).toBeInTheDocument();
  });

  it("renders step 2 heading correctly", () => {
    render(<CheckoutProgress currentStep={2} />);
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });

  it("renders step 3 heading correctly", () => {
    render(<CheckoutProgress currentStep={3} />);
    expect(screen.getByText("Payment & Review")).toBeInTheDocument();
  });

  it("renders all three step numbers", () => {
    render(<CheckoutProgress currentStep={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders step labels", () => {
    render(<CheckoutProgress currentStep={1} />);
    expect(screen.getByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
  });

  it("highlights current and completed steps with primary color", () => {
    const { container } = render(<CheckoutProgress currentStep={2} />);
    const stepCircles = container.querySelectorAll(".rounded-full");

    // Step 1 (completed) and Step 2 (current) should have primary bg
    expect(stepCircles[0].className).toContain("bg-primary");
    expect(stepCircles[1].className).toContain("bg-primary");
    // Step 3 (future) should have muted bg
    expect(stepCircles[2].className).toContain("bg-muted");
  });

  it("shows muted style for future steps", () => {
    const { container } = render(<CheckoutProgress currentStep={1} />);
    const stepCircles = container.querySelectorAll(".rounded-full.flex");

    // Steps 2 and 3 should be muted
    expect(stepCircles[1].className).toContain("bg-muted");
    expect(stepCircles[2].className).toContain("bg-muted");
  });

  it("renders connector lines between steps", () => {
    const { container } = render(<CheckoutProgress currentStep={2} />);
    const connectors = container.querySelectorAll(".h-1.rounded");

    // 2 connectors (between step 1-2 and step 2-3)
    expect(connectors).toHaveLength(2);
    // First connector (completed): primary
    expect(connectors[0].className).toContain("bg-primary");
    // Second connector (not yet): muted
    expect(connectors[1].className).toContain("bg-muted");
  });

  it("shows all connectors as primary on step 3", () => {
    const { container } = render(<CheckoutProgress currentStep={3} />);
    const connectors = container.querySelectorAll(".h-1.rounded");

    expect(connectors[0].className).toContain("bg-primary");
    expect(connectors[1].className).toContain("bg-primary");
  });
});
