/**
 * Payment Failed Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/checkout/payment-failed",
  useSearchParams: () => ({ get: mockGet }),
}));

import PaymentFailedPage from "../page";

describe("PaymentFailedPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the failure message", () => {
    mockGet.mockReturnValue(null);
    render(<PaymentFailedPage />);
    expect(
      screen.getByRole("heading", { name: /payment failed/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/unable to process your payment/i)).toBeInTheDocument();
  });

  it("renders retry and return buttons", () => {
    mockGet.mockReturnValue(null);
    render(<PaymentFailedPage />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByText(/return to cart/i)).toBeInTheDocument();
  });

  it("shows order reference when orderId present", () => {
    mockGet.mockReturnValue("order-xyz12345");
    render(<PaymentFailedPage />);
    expect(screen.getByText("XYZ12345")).toBeInTheDocument(); // last 8 chars uppercased
    expect(screen.getByText(/order has been saved/i)).toBeInTheDocument();
  });

  it("navigates to checkout on retry", () => {
    mockGet.mockReturnValue(null);
    render(<PaymentFailedPage />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });

  it("shows help notice", () => {
    mockGet.mockReturnValue(null);
    render(<PaymentFailedPage />);
    expect(screen.getByText(/need help/i)).toBeInTheDocument();
  });
});
