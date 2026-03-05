/**
 * Forgot Password Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock dependencies
jest.mock("@/lib/api/auth", () => ({
  AuthApi: {
    forgotPassword: jest.fn(),
  },
}));

import ForgotPasswordPage from "../page";
import { AuthApi } from "@/lib/api/auth";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/forgot-password",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the initial form with heading and email input", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("heading", { name: /reset your password/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset code/i })
    ).toBeInTheDocument();
  });

  it("renders cancel button that navigates to login", () => {
    render(<ForgotPasswordPage />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("shows success state after form submission", async () => {
    (AuthApi.forgotPassword as jest.Mock).mockResolvedValue({});
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset code/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /check your email/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter reset code/i })
    ).toBeInTheDocument();
  });

  it('shows "Try a different email" button in success state', async () => {
    (AuthApi.forgotPassword as jest.Mock).mockResolvedValue({});
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset code/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /try a different email/i })
      ).toBeInTheDocument();
    });

    // Click "Try a different email" to go back to form
    fireEvent.click(
      screen.getByRole("button", { name: /try a different email/i })
    );
    expect(
      screen.getByRole("heading", { name: /reset your password/i })
    ).toBeInTheDocument();
  });

  it("handles API error with user-not-found gracefully (prevents enumeration)", async () => {
    (AuthApi.forgotPassword as jest.Mock).mockRejectedValue(
      new Error("No user found")
    );
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nobody@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset code/i }));

    // Should still show success for security
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /check your email/i })
      ).toBeInTheDocument();
    });
  });
});
