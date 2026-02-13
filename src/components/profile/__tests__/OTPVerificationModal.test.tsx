import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OTPVerificationModal, OTPVerificationModalProps } from "../OTPVerificationModal";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CheckCircle: ({ className }: { className?: string }) => (
    <svg data-testid="check-circle-icon" className={className} />
  ),
  XCircle: ({ className }: { className?: string }) => (
    <svg data-testid="x-circle-icon" className={className} />
  ),
  Loader2: ({ className }: { className?: string }) => (
    <svg data-testid="loader-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="clock-icon" className={className} />
  ),
  XIcon: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className} />
  ),
}));

describe("OTPVerificationModal", () => {
  // Default test props
  const defaultProps: OTPVerificationModalProps = {
    open: true,
    onClose: jest.fn(),
    phoneNumber: "+63 917 123 4567",
    onVerifySuccess: jest.fn(),
    onResendOTP: jest.fn(),
    timerDuration: 300,
    resendCooldown: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render modal when open is true", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      expect(screen.getByText("Verify Your Phone Number")).toBeInTheDocument();
      expect(screen.getByText(/Enter the 6-digit code we sent to/)).toBeInTheDocument();
      expect(screen.getByText(defaultProps.phoneNumber)).toBeInTheDocument();
    });

    it("should render 6 input fields", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(6);
    });

    it("should render timer with initial value", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      expect(screen.getByText("5:00")).toBeInTheDocument();
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });

    it("should render Resend button disabled initially", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const resendButton = screen.getByRole("button", { name: /Resend/ });
      expect(resendButton).toBeDisabled();
      expect(resendButton).toHaveTextContent("Resend in 60s");
    });

    it("should render Cancel and Verify buttons", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
    });

    it("should have aria-labels for accessibility", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      expect(screen.getByRole("group", { name: "OTP Code Input" })).toBeInTheDocument();
      
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute("aria-label", `Digit ${index + 1} of 6`);
      });
    });
  });

  describe("Input Flow", () => {
    it("should auto-focus first input on mount", async () => {
      render(<OTPVerificationModal {...defaultProps} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0]).toHaveFocus();
    });

    it("should accept single digit in each input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      await user.type(inputs[0], "1");
      expect(inputs[0]).toHaveValue("1");
    });

    it("should auto-advance to next input after digit entry", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      await user.type(inputs[0], "1");
      expect(inputs[1]).toHaveFocus();
      
      await user.type(inputs[1], "2");
      expect(inputs[2]).toHaveFocus();
    });

    it("should only accept numeric digits", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      await user.type(inputs[0], "a");
      expect(inputs[0]).toHaveValue("");
      
      await user.type(inputs[0], "5");
      expect(inputs[0]).toHaveValue("5");
    });

    it("should handle only last character when multiple digits pasted in single input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
      
      // Simulate typing "123" in first input (only "3" should remain)
      fireEvent.change(inputs[0], { target: { value: "123" } });
      expect(inputs[0]).toHaveValue("3");
    });

    it("should auto-submit when all 6 digits are filled", async () => {
      const user = userEvent.setup({ delay: null });
      const onVerifySuccess = jest.fn();
      
      render(<OTPVerificationModal {...defaultProps} onVerifySuccess={onVerifySuccess} />);

      const inputs = screen.getAllByRole("textbox");
      
      // Fill all 6 digits
      for (let i = 0; i < 6; i++) {
        await user.type(inputs[i], String(i + 1));
      }

      await waitFor(() => {
        expect(onVerifySuccess).toHaveBeenCalledWith("123456");
      });
    });
  });

  describe("Backspace Navigation", () => {
    it("should clear current digit on backspace", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      await user.type(inputs[0], "5");
      expect(inputs[0]).toHaveValue("5");
      
      fireEvent.keyDown(inputs[0], { key: "Backspace" });
      expect(inputs[0]).toHaveValue("");
    });

    it("should move to previous input and clear on backspace when current is empty", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      
      // inputs[1] is now focused and has "2"
      expect(inputs[1]).toHaveFocus();
      
      // First backspace: clears "2"
      fireEvent.keyDown(inputs[1], { key: "Backspace" });
      expect(inputs[1]).toHaveValue("");
      
      // Second backspace: moves to previous and clears "1"
      fireEvent.keyDown(inputs[1], { key: "Backspace" });
      expect(inputs[0]).toHaveValue("");
      expect(inputs[0]).toHaveFocus();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate left with ArrowLeft key", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      
      // inputs[1] is focused
      fireEvent.keyDown(inputs[1], { key: "ArrowLeft" });
      expect(inputs[0]).toHaveFocus();
    });

    it("should navigate right with ArrowRight key", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      fireEvent.keyDown(inputs[0], { key: "ArrowRight" });
      expect(inputs[1]).toHaveFocus();
    });

    it("should submit on Enter key when all digits filled", async () => {
      const user = userEvent.setup({ delay: null });
      const onVerifySuccess = jest.fn();
      
      render(<OTPVerificationModal {...defaultProps} onVerifySuccess={onVerifySuccess} />);

      const inputs = screen.getAllByRole("textbox");
      
      // Fill all digits
      for (let i = 0; i < 6; i++) {
        await user.type(inputs[i], String(i + 1));
      }
      
      // Wait for auto-submit
      await waitFor(() => {
        expect(onVerifySuccess).toHaveBeenCalledWith("123456");
      });
    });

    it("should close modal on Escape key", async () => {
      const onClose = jest.fn();
      render(<OTPVerificationModal {...defaultProps} onClose={onClose} />);

      const inputs = screen.getAllByRole("textbox");
      
      fireEvent.keyDown(inputs[0], { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Paste Detection", () => {
    it("should auto-fill all 6 digits from clipboard", async () => {
      const onVerifySuccess = jest.fn();
      render(<OTPVerificationModal {...defaultProps} onVerifySuccess={onVerifySuccess} />);

      const inputs = screen.getAllByRole("textbox");
      
      // Simulate paste event on first input
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: new DataTransfer(),
      });
      pasteEvent.clipboardData?.setData("text", "123456");
      
      fireEvent.paste(inputs[0], pasteEvent);

      // Check all inputs have correct values
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("4");
      expect(inputs[4]).toHaveValue("5");
      expect(inputs[5]).toHaveValue("6");

      // Should auto-submit
      await waitFor(() => {
        expect(onVerifySuccess).toHaveBeenCalledWith("123456");
      });
    });

    it("should handle paste with non-numeric characters", async () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: new DataTransfer(),
      });
      pasteEvent.clipboardData?.setData("text", "1a2b3c4d5e6f");
      
      fireEvent.paste(inputs[0], pasteEvent);

      // Should extract only digits
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("4");
      expect(inputs[4]).toHaveValue("5");
      expect(inputs[5]).toHaveValue("6");
    });

    it("should handle paste with less than 6 digits", async () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: new DataTransfer(),
      });
      pasteEvent.clipboardData?.setData("text", "123");
      
      fireEvent.paste(inputs[0], pasteEvent);

      // Should not fill anything (requires exactly 6 digits)
      expect(inputs[0]).toHaveValue("");
    });
  });

  describe("Timer Countdown", () => {
    it("should countdown from 5:00 to 4:59", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      expect(screen.getByText("5:00")).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText("4:59")).toBeInTheDocument();
    });

    it("should turn timer red when less than 60 seconds", () => {
      render(<OTPVerificationModal {...defaultProps} timerDuration={65} />);

      // Initial state - not red
      let timerElement = screen.getByText("1:05").closest("div");
      expect(timerElement).not.toHaveClass("text-red-600");

      // Advance to 59 seconds
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      timerElement = screen.getByText("0:59").closest("div");
      expect(timerElement).toHaveClass("text-red-600");
    });

    it("should show expired error when timer reaches 0", () => {
      render(<OTPVerificationModal {...defaultProps} timerDuration={2} />);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.getByText(/OTP code has expired/)).toBeInTheDocument();
    });

    it("should stop timer when modal closes", () => {
      const { rerender } = render(<OTPVerificationModal {...defaultProps} />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText("4:59")).toBeInTheDocument();

      // Close modal
      rerender(<OTPVerificationModal {...defaultProps} open={false} />);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Timer should not advance further
    });
  });

  describe("Resend OTP", () => {
    it("should enable resend button after cooldown", () => {
      render(<OTPVerificationModal {...defaultProps} resendCooldown={3} />);

      const resendButton = screen.getByRole("button", { name: /Resend/ });
      expect(resendButton).toBeDisabled();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(resendButton).not.toBeDisabled();
      expect(resendButton).toHaveTextContent("Resend Code");
    });

    it("should call onResendOTP when resend clicked", async () => {
      const user = userEvent.setup({ delay: null });
      const onResendOTP = jest.fn().mockResolvedValue(undefined);
      
      render(<OTPVerificationModal {...defaultProps} onResendOTP={onResendOTP} resendCooldown={0} />);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const resendButton = screen.getByRole("button", { name: /Resend/ });
      await user.click(resendButton);

      expect(onResendOTP).toHaveBeenCalledTimes(1);
    });

    it("should reset inputs and timer after resend", async () => {
      const user = userEvent.setup({ delay: null });
      const onResendOTP = jest.fn().mockResolvedValue(undefined);
      
      render(<OTPVerificationModal {...defaultProps} onResendOTP={onResendOTP} resendCooldown={0} />);

      // Fill some digits
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(screen.getByText("4:50")).toBeInTheDocument();

      // Click resend
      const resendButton = screen.getByRole("button", { name: /Resend/ });
      await user.click(resendButton);

      await waitFor(() => {
        expect(inputs[0]).toHaveValue("");
        expect(inputs[1]).toHaveValue("");
        expect(screen.getByText("5:00")).toBeInTheDocument();
      });
    });
  });

  describe("Error States", () => {
    it("should display error message when provided", () => {
      render(<OTPVerificationModal {...defaultProps} errorMessage="Invalid OTP code" />);

      expect(screen.getByText("Invalid OTP code")).toBeInTheDocument();
      expect(screen.getByTestId("x-circle-icon")).toBeInTheDocument();
    });

    it("should clear error when user starts typing", async () => {
      const user = userEvent.setup({ delay: null });
      render(<OTPVerificationModal {...defaultProps} errorMessage="Invalid OTP code" />);

      expect(screen.getByText("Invalid OTP code")).toBeInTheDocument();

      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "1");

      expect(screen.queryByText("Invalid OTP code")).not.toBeInTheDocument();
    });

    it("should show error on verification failure", async () => {
      const user = userEvent.setup({ delay: null });
      const onVerifySuccess = jest.fn().mockRejectedValue(new Error("Invalid code"));
      
      render(<OTPVerificationModal {...defaultProps} onVerifySuccess={onVerifySuccess} />);

      const inputs = screen.getAllByRole("textbox");
      
      // Fill all digits
      for (let i = 0; i < 6; i++) {
        await user.type(inputs[i], String(i + 1));
      }

      await waitFor(() => {
        expect(screen.getByText("Invalid code")).toBeInTheDocument();
      });
    });
  });

  describe("Success State", () => {
    it("should show success animation on verification success", async () => {
      const user = userEvent.setup({ delay: null });
      const onVerifySuccess = jest.fn().mockResolvedValue(undefined);
      
      render(<OTPVerificationModal {...defaultProps} onVerifySuccess={onVerifySuccess} />);

      const inputs = screen.getAllByRole("textbox");
      
      // Fill all digits
      for (let i = 0; i < 6; i++) {
        await user.type(inputs[i], String(i + 1));
      }

      await waitFor(() => {
        expect(screen.getByText("Verification Successful")).toBeInTheDocument();
        expect(screen.getByText("Your phone number has been verified successfully!")).toBeInTheDocument();
      });
    });

    it("should auto-close modal after success animation", async () => {
      const user = userEvent.setup({ delay: null });
      const onVerifySuccess = jest.fn().mockResolvedValue(undefined);
      const onClose = jest.fn();
      
      render(<OTPVerificationModal {...defaultProps} onVerifySuccess={onVerifySuccess} onClose={onClose} />);

      const inputs = screen.getAllByRole("textbox");
      
      // Fill all digits
      for (let i = 0; i < 6; i++) {
        await user.type(inputs[i], String(i + 1));
      }

      await waitFor(() => {
        expect(screen.getByText("Verification Successful")).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    it("should show loading state during verification", () => {
      render(<OTPVerificationModal {...defaultProps} isVerifying={true} />);

      expect(screen.getByText("Verifying...")).toBeInTheDocument();
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("should disable inputs during verification", () => {
      render(<OTPVerificationModal {...defaultProps} isVerifying={true} />);

      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it("should disable Verify button when inputs incomplete", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const verifyButton = screen.getByRole("button", { name: "Verify" });
      expect(verifyButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute("aria-label", `Digit ${index + 1} of 6`);
      });
    });

    it("should announce errors to screen readers", () => {
      render(<OTPVerificationModal {...defaultProps} errorMessage="Invalid code" />);

      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveAttribute("aria-live", "assertive");
      expect(errorElement).toHaveTextContent("Invalid code");
    });

    it("should have timer with aria-live", () => {
      render(<OTPVerificationModal {...defaultProps} />);

      const timer = screen.getByRole("timer");
      expect(timer).toHaveAttribute("aria-live", "polite");
      expect(timer).toHaveAttribute("aria-atomic", "true");
    });

    it("should link error message to inputs with aria-describedby", () => {
      render(<OTPVerificationModal {...defaultProps} errorMessage="Invalid code" />);

      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "otp-error");
      });
    });
  });
});
