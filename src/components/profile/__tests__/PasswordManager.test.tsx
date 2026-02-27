/**
 * PasswordManager Component Tests
 *
 * Tests for the password management component that handles:
 * - Changing password for email-auth users
 * - Linking a password to Google-auth accounts
 * - Validation (min length, match, same-as-current)
 * - Firebase auth integration (reauthenticate, updatePassword, linkWithCredential)
 * - Success/error toasts and form reset
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordManager } from "../PasswordManager";
import type { PasswordManagerProps } from "../PasswordManager";

// ============================================================================
// Mocks
// ============================================================================

// Global sonner toast mock from jest.setupMocks.js
const mockToast = (global as Record<string, unknown>).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
};
const mockToastSuccess = mockToast.success;
const mockToastError = mockToast.error;

// Firebase auth mocks — capture the module-level mocks so we can configure per-test
const mockUpdatePassword = jest.fn().mockResolvedValue(undefined);
const mockReauthenticateWithCredential = jest.fn().mockResolvedValue(undefined);
const mockLinkWithCredential = jest
  .fn()
  .mockResolvedValue({ user: { uid: "u1" } });
const mockEmailAuthProviderCredential = jest
  .fn()
  .mockReturnValue({ providerId: "password" });

const mockCurrentUser = {
  uid: "u1",
  email: "user@example.com",
};

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: mockCurrentUser,
  })),
  updatePassword: (...args: unknown[]) => mockUpdatePassword(...args),
  reauthenticateWithCredential: (...args: unknown[]) =>
    mockReauthenticateWithCredential(...args),
  linkWithCredential: (...args: unknown[]) =>
    mockLinkWithCredential(...args),
  EmailAuthProvider: {
    credential: (...args: unknown[]) =>
      mockEmailAuthProviderCredential(...args),
  },
}));

// Mock shadcn Dialog — render children when open
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock lucide-react icons as simple spans
jest.mock("lucide-react", () => ({
  Lock: (props: Record<string, unknown>) => (
    <span data-testid="icon-lock" {...props} />
  ),
  Key: (props: Record<string, unknown>) => (
    <span data-testid="icon-key" {...props} />
  ),
  Shield: (props: Record<string, unknown>) => (
    <span data-testid="icon-shield" {...props} />
  ),
  Info: (props: Record<string, unknown>) => (
    <span data-testid="icon-info" {...props} />
  ),
  CheckCircle2: (props: Record<string, unknown>) => (
    <span data-testid="icon-check" {...props} />
  ),
  AlertTriangle: (props: Record<string, unknown>) => (
    <span data-testid="icon-alert" {...props} />
  ),
  Loader2: (props: Record<string, unknown>) => (
    <span data-testid="icon-loader" {...props} />
  ),
}));

// ============================================================================
// Helpers
// ============================================================================

const defaultProps: PasswordManagerProps = {
  authProvider: "email",
  hasPassword: true,
};

function renderComponent(overrides: Partial<PasswordManagerProps> = {}) {
  return render(<PasswordManager {...defaultProps} {...overrides} />);
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PasswordManager", () => {
  // --------------------------------------------------------------------------
  // Rendering based on authProvider / hasPassword
  // --------------------------------------------------------------------------

  describe("Rendering by auth provider", () => {
    it("renders 'Change Password' button for email auth provider", () => {
      renderComponent({ authProvider: "email", hasPassword: true });
      expect(
        screen.getByRole("button", { name: /change password/i }),
      ).toBeInTheDocument();
    });

    it("renders 'Add Password' button for Google provider without password", () => {
      renderComponent({ authProvider: "google", hasPassword: false });
      expect(
        screen.getByRole("button", { name: /add password/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/enhance your account security/i)).toBeInTheDocument();
    });

    it("renders both security alert and 'Change Password' button for Google provider with password", () => {
      renderComponent({ authProvider: "google", hasPassword: true });
      expect(
        screen.getByText(/secured with both google sign-in/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /change password/i }),
      ).toBeInTheDocument();
    });

    it("renders nothing for unknown auth provider", () => {
      const { container } = renderComponent({ authProvider: "unknown" });
      // The component returns a fragment wrapping null + two closed dialogs
      expect(container.textContent).toBe("");
    });
  });

  // --------------------------------------------------------------------------
  // Change Password Dialog
  // --------------------------------------------------------------------------

  describe("Change Password dialog", () => {
    async function openChangeDialog() {
      const user = userEvent.setup();
      renderComponent({ authProvider: "email", hasPassword: true });
      await user.click(
        screen.getByRole("button", { name: /change password/i }),
      );
      return user;
    }

    it("opens dialog with all three password fields", async () => {
      await openChangeDialog();

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it("shows dialog title and description", async () => {
      await openChangeDialog();
      expect(
        screen.getByRole("heading", { name: /change password/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/enter your current password and choose a new one/i),
      ).toBeInTheDocument();
    });

    it("shows mismatch alert when passwords differ", async () => {
      const user = await openChangeDialog();

      await user.type(screen.getByLabelText(/^new password/i), "abcdef");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "ghijkl",
      );

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    it("shows min-length alert when new password is too short", async () => {
      const user = await openChangeDialog();

      await user.type(screen.getByLabelText(/^new password/i), "abc");

      expect(
        screen.getByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
    });

    it("does not show mismatch or length alerts when fields are empty", async () => {
      await openChangeDialog();

      expect(
        screen.queryByText("Passwords do not match"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters/i),
      ).not.toBeInTheDocument();
    });

    it("shows error toast when submitting with empty fields", async () => {
      const user = await openChangeDialog();

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      expect(mockToastError).toHaveBeenCalledWith(
        "Please fill in all password fields",
      );
    });

    it("shows error toast when new passwords do not match on submit", async () => {
      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "different",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      expect(mockToastError).toHaveBeenCalledWith(
        "New passwords do not match",
      );
    });

    it("shows error toast when new password is shorter than 6 characters on submit", async () => {
      const user = await openChangeDialog();

      await user.type(screen.getByLabelText(/current password/i), "oldPw");
      await user.type(screen.getByLabelText(/^new password/i), "ab");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "ab",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      expect(mockToastError).toHaveBeenCalledWith(
        "Password must be at least 6 characters",
      );
    });

    it("shows error toast when new password equals current password", async () => {
      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "samePass",
      );
      await user.type(screen.getByLabelText(/^new password/i), "samePass");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "samePass",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      expect(mockToastError).toHaveBeenCalledWith(
        "New password must be different from current password",
      );
    });

    it("calls Firebase reauthenticate + updatePassword on valid submit and shows success toast", async () => {
      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      await waitFor(() => {
        expect(mockReauthenticateWithCredential).toHaveBeenCalledTimes(1);
        expect(mockUpdatePassword).toHaveBeenCalledTimes(1);
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Password updated successfully!",
        );
      });
    });

    it("shows 'Current password is incorrect' toast on auth/wrong-password error", async () => {
      mockReauthenticateWithCredential.mockRejectedValueOnce({
        code: "auth/wrong-password",
      });

      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "wrongPw",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Current password is incorrect",
        );
      });
    });

    it("shows re-login toast on auth/requires-recent-login error", async () => {
      mockReauthenticateWithCredential.mockRejectedValueOnce({
        code: "auth/requires-recent-login",
      });

      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Please sign out and sign in again before changing password",
        );
      });
    });

    it("shows generic error message for unknown Firebase errors", async () => {
      mockReauthenticateWithCredential.mockRejectedValueOnce({
        code: "auth/internal-error",
        message: "Something broke",
      });

      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Something broke");
      });
    });

    it("disables buttons while loading", async () => {
      // Make the reauthenticate hang so loading state persists
      let resolveReauth!: () => void;
      mockReauthenticateWithCredential.mockReturnValueOnce(
        new Promise<void>((r) => {
          resolveReauth = r;
        }),
      );

      const user = await openChangeDialog();

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      // While loading, both Cancel and Update buttons should be disabled
      await waitFor(() => {
        expect(screen.getByText(/updating/i)).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      expect(cancelBtn).toBeDisabled();

      // Resolve to clean up
      resolveReauth();
      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalled();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Link Password Dialog (Google users without password)
  // --------------------------------------------------------------------------

  describe("Link Password dialog", () => {
    async function openLinkDialog() {
      const user = userEvent.setup();
      renderComponent({ authProvider: "google", hasPassword: false });
      await user.click(
        screen.getByRole("button", { name: /add password/i }),
      );
      return user;
    }

    it("opens dialog with new password and confirm password fields", async () => {
      await openLinkDialog();

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("shows informational content about why to add a password", async () => {
      await openLinkDialog();
      expect(screen.getByText(/why add a password/i)).toBeInTheDocument();
      expect(
        screen.getByText(/sign in with email\/password when google is unavailable/i),
      ).toBeInTheDocument();
    });

    it("shows error toast when submitting empty fields", async () => {
      const user = await openLinkDialog();

      // Click the submit "Add Password" button inside the dialog footer
      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      // The last one is in the dialog footer
      await user.click(buttons[buttons.length - 1]);

      expect(mockToastError).toHaveBeenCalledWith(
        "Please fill in all fields",
      );
    });

    it("shows error toast for mismatched passwords on submit", async () => {
      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "password1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "password2",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      expect(mockToastError).toHaveBeenCalledWith(
        "Passwords do not match",
      );
    });

    it("shows error toast for password shorter than 6 characters on submit", async () => {
      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "ab");
      await user.type(screen.getByLabelText(/confirm password/i), "ab");

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      expect(mockToastError).toHaveBeenCalledWith(
        "Password must be at least 6 characters",
      );
    });

    it("calls linkWithCredential and onPasswordLinked callback on success", async () => {
      const onPasswordLinked = jest.fn();
      const user = userEvent.setup();
      render(
        <PasswordManager
          authProvider="google"
          hasPassword={false}
          onPasswordLinked={onPasswordLinked}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: /add password/i }),
      );

      await user.type(screen.getByLabelText(/new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "newPass1",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(mockLinkWithCredential).toHaveBeenCalledTimes(1);
        expect(onPasswordLinked).toHaveBeenCalledTimes(1);
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Password added successfully! You can now sign in with email/password.",
        );
      });
    });

    it("shows specific toast for auth/email-already-in-use error", async () => {
      mockLinkWithCredential.mockRejectedValueOnce({
        code: "auth/email-already-in-use",
      });

      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "newPass1",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "This email already has a password. Try signing in with email/password instead.",
        );
      });
    });

    it("shows specific toast and calls onPasswordLinked for auth/provider-already-linked error", async () => {
      mockLinkWithCredential.mockRejectedValueOnce({
        code: "auth/provider-already-linked",
      });
      const onPasswordLinked = jest.fn();

      const user = userEvent.setup();
      render(
        <PasswordManager
          authProvider="google"
          hasPassword={false}
          onPasswordLinked={onPasswordLinked}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: /add password/i }),
      );

      await user.type(screen.getByLabelText(/new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "newPass1",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "A password is already linked to this account",
        );
        expect(onPasswordLinked).toHaveBeenCalledTimes(1);
      });
    });

    it("shows specific toast for auth/weak-password error", async () => {
      mockLinkWithCredential.mockRejectedValueOnce({
        code: "auth/weak-password",
      });

      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "newPass1",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Password is too weak. Please use a stronger password.",
        );
      });
    });

    it("shows mismatch alert inline when link passwords differ", async () => {
      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "abcdef");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "ghijkl",
      );

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    it("shows min-length alert inline when link new password is too short", async () => {
      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "abc");

      expect(
        screen.getByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
    });

    it("disables buttons while link password is loading", async () => {
      let resolveLink!: () => void;
      mockLinkWithCredential.mockReturnValueOnce(
        new Promise<void>((r) => {
          resolveLink = r;
        }),
      );

      const user = await openLinkDialog();

      await user.type(screen.getByLabelText(/new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "newPass1",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(/adding password/i)).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      expect(cancelBtn).toBeDisabled();

      // Resolve to clean up
      resolveLink();
      await waitFor(() => {
        expect(mockLinkWithCredential).toHaveBeenCalled();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------------------------

  describe("Edge cases", () => {
    it("shows error toast if no user is signed in during change password", async () => {
      // Override getAuth to return null currentUser
      const firebaseAuth = jest.requireMock("firebase/auth");
      firebaseAuth.getAuth.mockReturnValueOnce({ currentUser: null });

      const user = userEvent.setup();
      renderComponent({ authProvider: "email", hasPassword: true });
      await user.click(
        screen.getByRole("button", { name: /change password/i }),
      );

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "No user is currently signed in",
        );
      });
    });

    it("shows error toast if no user is signed in during link password", async () => {
      const firebaseAuth = jest.requireMock("firebase/auth");
      firebaseAuth.getAuth.mockReturnValueOnce({ currentUser: null });

      const user = userEvent.setup();
      renderComponent({ authProvider: "google", hasPassword: false });
      await user.click(
        screen.getByRole("button", { name: /add password/i }),
      );

      await user.type(screen.getByLabelText(/new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "newPass1",
      );

      const buttons = screen.getAllByRole("button", {
        name: /add password/i,
      });
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "No user is currently signed in",
        );
      });
    });

    it("falls back to generic message when Firebase error has no message", async () => {
      mockReauthenticateWithCredential.mockRejectedValueOnce({
        code: "auth/unknown",
      });

      const user = userEvent.setup();
      renderComponent({ authProvider: "email", hasPassword: true });
      await user.click(
        screen.getByRole("button", { name: /change password/i }),
      );

      await user.type(
        screen.getByLabelText(/current password/i),
        "oldPass1",
      );
      await user.type(screen.getByLabelText(/^new password/i), "newPass1");
      await user.type(
        screen.getByLabelText(/confirm new password/i),
        "newPass1",
      );

      await user.click(
        screen.getByRole("button", { name: /update password/i }),
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to change password",
        );
      });
    });
  });
});
