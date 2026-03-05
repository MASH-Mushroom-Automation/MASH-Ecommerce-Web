/**
 * Shipping Info Page render tests (Server Component - static content)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import ShippingInfoPage from "../page";

describe("ShippingInfoPage", () => {
  it("renders the page heading", () => {
    render(<ShippingInfoPage />);
    expect(
      screen.getByRole("heading", { name: /shipping information/i })
    ).toBeInTheDocument();
  });

  it("renders quick stats cards", () => {
    render(<ShippingInfoPage />);
    expect(screen.getByText(/fast delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/safe packaging/i)).toBeInTheDocument();
    expect(screen.getByText(/freshness guarantee/i)).toBeInTheDocument();
  });

  it("renders delivery area and rates info", () => {
    render(<ShippingInfoPage />);
    expect(screen.getByText(/2-5 business days/i)).toBeInTheDocument();
    expect(screen.getByText(/100% satisfaction/i)).toBeInTheDocument();
  });
});
