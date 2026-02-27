/**
 * Returns Policy Page render tests (Server Component - static content)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import ReturnsPolicyPage from "../page";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("ReturnsPolicyPage", () => {
  it("renders the page heading and badge", () => {
    render(<ReturnsPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /returns & refunds policy/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/updated: january 2025/i)).toBeInTheDocument();
  });

  it("renders important notice alert about perishable products", () => {
    render(<ReturnsPolicyPage />);
    expect(screen.getByText(/important notice/i)).toBeInTheDocument();
    expect(screen.getByText(/perishable nature/i)).toBeInTheDocument();
  });

  it("renders freshness guarantee section", () => {
    render(<ReturnsPolicyPage />);
    expect(screen.getByText(/our freshness guarantee/i)).toBeInTheDocument();
  });

  it("renders contact section", () => {
    render(<ReturnsPolicyPage />);
    expect(screen.getAllByText(/contact/i).length).toBeGreaterThan(0);
  });
});
