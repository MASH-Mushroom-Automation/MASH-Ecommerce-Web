import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DriverInfoCard from "../DriverInfoCard";

describe("DriverInfoCard", () => {
  it("renders driver name", () => {
    render(<DriverInfoCard name="Juan Cruz" />);
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
  });

  it("renders plate number when provided", () => {
    render(<DriverInfoCard name="Juan Cruz" plateNumber="ABC 1234" />);
    expect(screen.getByText("ABC 1234")).toBeInTheDocument();
  });

  it("does not render plate number when not provided", () => {
    render(<DriverInfoCard name="Juan Cruz" />);
    expect(screen.queryByText("ABC 1234")).not.toBeInTheDocument();
  });

  it("renders Call button when phone provided", () => {
    render(<DriverInfoCard name="Juan Cruz" phone="+639171234567" />);
    expect(screen.getByText("Call")).toBeInTheDocument();
  });

  it("does not render Call button when no phone", () => {
    render(<DriverInfoCard name="Juan Cruz" />);
    expect(screen.queryByText("Call")).not.toBeInTheDocument();
  });

  it("opens tel link when Call is clicked", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation();
    render(<DriverInfoCard name="Juan Cruz" phone="+639171234567" />);
    fireEvent.click(screen.getByText("Call"));
    expect(openSpy).toHaveBeenCalledWith("tel:+639171234567", "_self");
    openSpy.mockRestore();
  });

  it("shows User icon when no photo", () => {
    const { container } = render(<DriverInfoCard name="Juan Cruz" />);
    const svg = container.querySelector("svg.lucide-user");
    expect(svg).toBeInTheDocument();
  });

  it("shows photo when provided", () => {
    render(<DriverInfoCard name="Juan Cruz" photo="https://example.com/photo.jpg" />);
    const img = screen.getByAltText("Juan Cruz");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DriverInfoCard name="Juan Cruz" className="mt-4" />
    );
    expect(container.firstChild).toHaveClass("mt-4");
  });

  it("truncates long driver names", () => {
    const { container } = render(
      <DriverInfoCard name="Very Long Driver Name That Should Be Truncated" />
    );
    const nameEl = container.querySelector(".truncate");
    expect(nameEl).toBeInTheDocument();
  });
});
