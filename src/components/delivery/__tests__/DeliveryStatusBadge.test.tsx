import React from "react";
import { render, screen } from "@testing-library/react";
import DeliveryStatusBadge from "../DeliveryStatusBadge";

describe("DeliveryStatusBadge", () => {
  it("renders ASSIGNING_DRIVER as Finding Driver", () => {
    render(<DeliveryStatusBadge status="ASSIGNING_DRIVER" />);
    expect(screen.getByText("Finding Driver")).toBeInTheDocument();
  });

  it("renders ON_GOING as Driver En Route", () => {
    render(<DeliveryStatusBadge status="ON_GOING" />);
    expect(screen.getByText("Driver En Route")).toBeInTheDocument();
  });

  it("renders PICKED_UP as Picked Up", () => {
    render(<DeliveryStatusBadge status="PICKED_UP" />);
    expect(screen.getByText("Picked Up")).toBeInTheDocument();
  });

  it("renders COMPLETED as Delivered", () => {
    render(<DeliveryStatusBadge status="COMPLETED" />);
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("renders CANCELED as Canceled", () => {
    render(<DeliveryStatusBadge status="CANCELED" />);
    expect(screen.getByText("Canceled")).toBeInTheDocument();
  });

  it("renders REJECTED as Rejected", () => {
    render(<DeliveryStatusBadge status="REJECTED" />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("renders EXPIRED as Expired", () => {
    render(<DeliveryStatusBadge status="EXPIRED" />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("falls back to raw status text for unknown status", () => {
    render(<DeliveryStatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
  });

  it("applies yellow colors for ASSIGNING_DRIVER", () => {
    const { container } = render(<DeliveryStatusBadge status="ASSIGNING_DRIVER" />);
    const badge = container.querySelector("[data-slot='badge']") || container.firstChild;
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("applies green colors for COMPLETED", () => {
    const { container } = render(<DeliveryStatusBadge status="COMPLETED" />);
    const badge = container.querySelector("[data-slot='badge']") || container.firstChild;
    expect(badge).toHaveClass("bg-green-100");
  });

  it("applies red colors for CANCELED", () => {
    const { container } = render(<DeliveryStatusBadge status="CANCELED" />);
    const badge = container.querySelector("[data-slot='badge']") || container.firstChild;
    expect(badge).toHaveClass("bg-red-100");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DeliveryStatusBadge status="ON_GOING" className="ml-2" />
    );
    const badge = container.querySelector("[data-slot='badge']") || container.firstChild;
    expect(badge).toHaveClass("ml-2");
  });
});
