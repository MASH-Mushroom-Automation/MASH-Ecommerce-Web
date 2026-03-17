/**
 * Seller Index Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import SellerIndexPage from "../page";

describe("SellerIndexPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders redirect message", () => {
    render(<SellerIndexPage />);
    expect(
      screen.getByText("Redirecting to Seller Dashboard...")
    ).toBeInTheDocument();
  });

  it("redirects to /seller/dashboard on mount", () => {
    render(<SellerIndexPage />);
    expect(mockPush).toHaveBeenCalledWith("/seller/dashboard");
  });
});
