import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TwoFactorSettings,
  TwoFactorSettingsProps,
} from "../TwoFactorSettings";

// Use the global mock toast set up in jest.setupMocks.js
// sonner is already mocked globally via global.__mockToast
const mockToast = (global as Record<string, unknown>).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
};

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Shield: ({ className }: { className?: string }) => (
    <svg data-testid="shield-icon" className={className} />
  ),
  ShieldCheck: ({ className }: { className?: string }) => (
    <svg data-testid="shield-check-icon" className={className} />
  ),
  ShieldOff: ({ className }: { className?: string }) => (
    <svg data-testid="shield-off-icon" className={className} />
  ),
  Loader2: ({
    className,
    "data-testid": testId,
  }: {
    className?: string;
    "data-testid"?: string;
  }) => <svg data-testid={testId || "loader-icon"} className={className} />,
  Phone: ({ className }: { className?: string }) => (
    <svg data-testid="phone-icon" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <svg data-testid="info-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-triangle-icon" className={className} />
  ),
  XIcon: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className} />
  ),
}));

describe("TwoFactorSettings", () => {
  const defaultProps: TwoFactorSettingsProps = {
    enabled: false,
    phoneVerified: true,
    phoneNumber: "+63 917 123 4567",
    onEnable: jest.fn().mockResolvedValue(undefined),
    onDisable: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. Renders correctly in enabled state
  // =========================================================================
  describe("Enabled State", () => {
    it("renders correctly in enabled state", () => {
      render(<TwoFactorSettings {...defaultProps} enabled={true} />);

      expect(
        screen.getByText("Enable Two-Factor Authentication")
      ).toBeInTheDocument();
      expect(screen.getByTestId("status-badge-enabled")).toHaveTextContent(
        "Enabled"
      );
      expect(screen.getByTestId("shield-check-icon")).toBeInTheDocument();
      expect(screen.getByTestId("2fa-toggle")).toHaveAttribute(
        "data-state",
        "checked"
      );
    });
  });

  // =========================================================================
  // 2. Renders correctly in disabled state
  // =========================================================================
  describe("Disabled State", () => {
    it("renders correctly in disabled state", () => {
      render(<TwoFactorSettings {...defaultProps} enabled={false} />);

      expect(
        screen.getByText("Enable Two-Factor Authentication")
      ).toBeInTheDocument();
      expect(screen.getByTestId("status-badge-disabled")).toHaveTextContent(
        "Disabled"
      );
      expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
      expect(screen.getByTestId("2fa-toggle")).toHaveAttribute(
        "data-state",
        "unchecked"
      );
    });
  });

  // =========================================================================
  // 3. Shows "Phone not verified" tooltip when phoneVerified is false
  // =========================================================================
  describe("Phone Not Verified Tooltip", () => {
    it('shows phone not verified warning when phoneVerified is false', () => {
      render(
        <TwoFactorSettings {...defaultProps} phoneVerified={false} />
      );

      // The warning text should be visible
      expect(
        screen.getByText(
          "You need to verify your phone number before enabling two-factor authentication."
        )
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. Toggle is disabled when phoneVerified is false
  // =========================================================================
  describe("Toggle Disabled State", () => {
    it("toggle is disabled when phoneVerified is false", () => {
      render(
        <TwoFactorSettings {...defaultProps} phoneVerified={false} />
      );

      const toggle = screen.getByTestId("2fa-toggle");
      expect(toggle).toBeDisabled();
    });
  });

  // =========================================================================
  // 5. Calls onEnable when toggling on
  // =========================================================================
  describe("Enable Flow", () => {
    it("calls onEnable when toggling on", async () => {
      const onEnable = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          enabled={false}
          onEnable={onEnable}
        />
      );

      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      await waitFor(() => {
        expect(onEnable).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "Two-factor authentication has been enabled"
        );
      });
    });
  });

  // =========================================================================
  // 6. Shows confirmation dialog when toggling off
  // =========================================================================
  describe("Disable Confirmation Dialog", () => {
    it("shows confirmation dialog when toggling off", async () => {
      const user = userEvent.setup();

      render(<TwoFactorSettings {...defaultProps} enabled={true} />);

      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      await waitFor(() => {
        expect(
          screen.getByText("Disable Two-Factor Authentication")
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Are you sure you want to disable 2FA? This will reduce the security of your account."
        )
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. Calls onDisable after confirming disable
  // =========================================================================
  describe("Confirm Disable", () => {
    it("calls onDisable after confirming disable", async () => {
      const onDisable = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          enabled={true}
          onDisable={onDisable}
        />
      );

      // Click toggle to show dialog
      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      // Click confirm disable button
      await waitFor(() => {
        expect(screen.getByTestId("confirm-disable-btn")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("confirm-disable-btn"));

      await waitFor(() => {
        expect(onDisable).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "Two-factor authentication has been disabled"
        );
      });
    });
  });

  // =========================================================================
  // 8. Does not call onDisable when cancelling confirmation
  // =========================================================================
  describe("Cancel Disable", () => {
    it("does not call onDisable when cancelling confirmation", async () => {
      const onDisable = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          enabled={true}
          onDisable={onDisable}
        />
      );

      // Click toggle to show dialog
      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      // Click cancel button
      await waitFor(() => {
        expect(screen.getByTestId("cancel-disable-btn")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("cancel-disable-btn"));

      expect(onDisable).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 9. Shows loading spinner during loading state
  // =========================================================================
  describe("Loading State", () => {
    it("shows loading spinner during loading state", () => {
      render(<TwoFactorSettings {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 10. Displays security notice text
  // =========================================================================
  describe("Security Notice", () => {
    it("displays security notice text", () => {
      render(<TwoFactorSettings {...defaultProps} />);

      expect(screen.getByTestId("security-notice")).toHaveTextContent(
        "Adds an extra layer of security to your account"
      );
    });
  });

  // =========================================================================
  // 11. Shows status badge (Enabled green / Disabled gray)
  // =========================================================================
  describe("Status Badge", () => {
    it("shows green Enabled badge when enabled", () => {
      render(<TwoFactorSettings {...defaultProps} enabled={true} />);

      const badge = screen.getByTestId("status-badge-enabled");
      expect(badge).toHaveTextContent("Enabled");
      expect(badge).toHaveClass("bg-green-600");
    });

    it("shows gray Disabled badge when disabled", () => {
      render(<TwoFactorSettings {...defaultProps} enabled={false} />);

      const badge = screen.getByTestId("status-badge-disabled");
      expect(badge).toHaveTextContent("Disabled");
      expect(badge).toHaveClass("bg-gray-200");
    });
  });

  // =========================================================================
  // 12. Shows phone number when verified
  // =========================================================================
  describe("Phone Number Display", () => {
    it("shows phone number when verified", () => {
      render(
        <TwoFactorSettings
          {...defaultProps}
          phoneVerified={true}
          phoneNumber="+63 917 123 4567"
        />
      );

      expect(screen.getByTestId("phone-display")).toHaveTextContent(
        "+63 917 123 4567"
      );
      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
    });

    it("does not show phone number when not verified", () => {
      render(
        <TwoFactorSettings {...defaultProps} phoneVerified={false} />
      );

      expect(screen.queryByTestId("phone-display")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 13. Reverts toggle on enable failure
  // =========================================================================
  describe("Enable Failure", () => {
    it("reverts toggle on enable failure and shows error toast", async () => {
      const onEnable = jest
        .fn()
        .mockRejectedValue(new Error("Enable failed"));
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          enabled={false}
          onEnable={onEnable}
        />
      );

      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      await waitFor(() => {
        expect(onEnable).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Failed to enable two-factor authentication"
        );
      });

      // Toggle should remain unchecked (parent controls the state)
      expect(toggle).toHaveAttribute("data-state", "unchecked");
    });
  });

  // =========================================================================
  // 14. Reverts toggle on disable failure
  // =========================================================================
  describe("Disable Failure", () => {
    it("reverts toggle on disable failure and shows error toast", async () => {
      const onDisable = jest
        .fn()
        .mockRejectedValue(new Error("Disable failed"));
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          enabled={true}
          onDisable={onDisable}
        />
      );

      // Click toggle to show dialog
      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      // Click confirm disable button
      await waitFor(() => {
        expect(screen.getByTestId("confirm-disable-btn")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("confirm-disable-btn"));

      await waitFor(() => {
        expect(onDisable).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Failed to disable two-factor authentication"
        );
      });

      // Toggle should remain checked (parent controls the state)
      expect(toggle).toHaveAttribute("data-state", "checked");
    });
  });

  // =========================================================================
  // 15. Disables toggle during loading
  // =========================================================================
  describe("Toggle During Loading", () => {
    it("disables toggle during external loading", () => {
      render(<TwoFactorSettings {...defaultProps} isLoading={true} />);

      const toggle = screen.getByTestId("2fa-toggle");
      expect(toggle).toBeDisabled();
    });

    it("disables toggle during internal loading (enable flow)", async () => {
      let resolveEnable: () => void;
      const onEnable = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveEnable = resolve;
          })
      );
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          enabled={false}
          onEnable={onEnable}
        />
      );

      const toggle = screen.getByTestId("2fa-toggle");
      await user.click(toggle);

      // During the async operation, loading spinner should be visible
      await waitFor(() => {
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      });

      // Toggle should be disabled during loading
      expect(toggle).toBeDisabled();

      // Resolve the promise to clean up
      resolveEnable!();
      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Additional edge cases
  // =========================================================================
  describe("Edge Cases", () => {
    it("accepts className prop", () => {
      const { container } = render(
        <TwoFactorSettings {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("does not call onEnable when phone is not verified", async () => {
      const onEnable = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TwoFactorSettings
          {...defaultProps}
          phoneVerified={false}
          onEnable={onEnable}
        />
      );

      const toggle = screen.getByTestId("2fa-toggle");
      // Toggle is disabled, so clicking should not trigger onEnable
      await user.click(toggle);

      expect(onEnable).not.toHaveBeenCalled();
    });
  });
});
