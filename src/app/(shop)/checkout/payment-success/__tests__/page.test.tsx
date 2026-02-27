/**
 * Payment Success Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/email/client", () => ({
  sendOrderConfirmationEmailViaAPI: jest.fn().mockResolvedValue({}),
}));

const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/checkout/payment-success",
  useSearchParams: () => ({ get: mockGet }),
}));

import PaymentSuccessPage from "../page";

describe("PaymentSuccessPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders success message after verification", async () => {
    mockGet.mockReturnValue("order-123abc");
    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /payment successful/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/23ABC/)).toBeInTheDocument(); // last 8 chars uppercased
  });

  it("renders action buttons", async () => {
    mockGet.mockReturnValue(null);
    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(/view order details/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/continue shopping/i)).toBeInTheDocument();
  });

  it("shows email confirmation notice", async () => {
    mockGet.mockReturnValue(null);
    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/confirmation email/i)
      ).toBeInTheDocument();
    });
  });
});
