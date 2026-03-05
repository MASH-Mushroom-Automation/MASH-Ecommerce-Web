/**
 * 404 Not Found Page render tests (Server Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import NotFound from "../not-found";

describe("NotFound (404 Page)", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders primary action links", () => {
    render(<NotFound />);
    expect(screen.getByText("Go Home")).toBeInTheDocument();
    expect(screen.getByText("Browse Products")).toBeInTheDocument();
  });

  it("renders popular pages section", () => {
    render(<NotFound />);
    expect(screen.getByText("Popular Pages")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
    expect(screen.getByText("Growers")).toBeInTheDocument();
    expect(screen.getByText("Help Center")).toBeInTheDocument();
  });

  it("renders contact support link", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/contact our support team/i)
    ).toBeInTheDocument();
  });
});
