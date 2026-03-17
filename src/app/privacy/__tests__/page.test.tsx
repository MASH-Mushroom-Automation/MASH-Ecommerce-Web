/**
 * Privacy Policy Page render tests (Server Component - static content)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "../page";

describe("PrivacyPolicyPage", () => {
  it("renders the page heading and badge", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /privacy policy/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/last updated: january 2025/i)).toBeInTheDocument();
  });

  it("renders numbered content sections", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/1\. Information We Collect/)).toBeInTheDocument();
    expect(screen.getByText(/2\. How We Use Your Information/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Information Sharing and Disclosure/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Cookies and Tracking Technologies/)).toBeInTheDocument();
    expect(screen.getByText(/5\. Data Security/)).toBeInTheDocument();
    expect(screen.getByText(/6\. Your Rights and Choices/)).toBeInTheDocument();
  });

  it("renders content details", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getAllByText(/personal information/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/payment information/i).length).toBeGreaterThan(0);
  });
});
