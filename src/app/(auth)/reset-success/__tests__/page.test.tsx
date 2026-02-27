/**
 * Reset Success Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import ResetSuccessPage from "../page";

describe("ResetSuccessPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the success heading and redirect notice", () => {
    render(<ResetSuccessPage />);
    expect(
      screen.getByRole("heading", { name: /reset password successful/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/automatically redirected/i)
    ).toBeInTheDocument();
  });

  it("renders back to sign in link", () => {
    render(<ResetSuccessPage />);
    const link = screen.getByRole("link", { name: /back to sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
