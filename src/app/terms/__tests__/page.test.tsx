/**
 * Terms of Service Page render tests (Server Component - static content)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import TermsPage from "../page";

describe("TermsPage", () => {
  it("renders the page heading and badge", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /terms of service/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/effective: january 2025/i)).toBeInTheDocument();
  });

  it("renders the agreement alert", () => {
    render(<TermsPage />);
    expect(
      screen.getByText(/by accessing and using/i)
    ).toBeInTheDocument();
  });

  it("renders all numbered content sections", () => {
    render(<TermsPage />);
    expect(screen.getByText(/1\. Acceptance of Terms/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Eligibility/)).toBeInTheDocument();
    expect(screen.getByText(/3\. User Accounts/)).toBeInTheDocument();
  });
});
