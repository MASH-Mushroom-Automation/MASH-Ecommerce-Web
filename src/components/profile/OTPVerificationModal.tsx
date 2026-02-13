"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OTP Modal State Types
 */
type OTPModalState = "idle" | "verifying" | "success" | "error";

/**
 * Props for OTPVerificationModal component
 */
export interface OTPVerificationModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal close is requested */
  onClose: () => void;
  /** Phone number being verified (for display) */
  phoneNumber: string;
  /** Callback when OTP verification succeeds */
  onVerifySuccess: (code: string) => void;
  /** Callback to resend OTP */
  onResendOTP: () => Promise<void>;
  /** Initial timer duration in seconds (default: 300 = 5 minutes) */
  timerDuration?: number;
  /** Resend cooldown duration in seconds (default: 60) */
  resendCooldown?: number;
  /** Current verification error message */
  errorMessage?: string;
  /** Whether verification is in progress */
  isVerifying?: boolean;
}

/**
 * OTP Verification Modal Component
 * 
 * Displays a 6-digit OTP input interface with:
 * - Auto-focus and auto-advance between inputs
 * - Backspace navigation and clearing
 * - Visual timer countdown with red warning state
 * - Resend OTP with cooldown enforcement
 * - Paste detection for auto-fill
 * - Keyboard shortcuts (Enter to submit, Escape to close)
 * - Success/error states with animations
 * - Full accessibility support
 */
export function OTPVerificationModal({
  open,
  onClose,
  phoneNumber,
  onVerifySuccess,
  onResendOTP,
  timerDuration = 300,
  resendCooldown = 60,
  errorMessage,
  isVerifying = false,
}: OTPVerificationModalProps) {
  // OTP digit state
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [state, setState] = useState<OTPModalState>("idle");
  const [localError, setLocalError] = useState<string>("");
  
  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(timerDuration);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  
  // Refs for input focus management
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resendCooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize timer on mount and reset on open
   */
  useEffect(() => {
    if (open) {
      setRemainingSeconds(timerDuration);
      setCanResend(false);
      setResendCooldownSeconds(resendCooldown);
      setState("idle");
      setLocalError("");
      setDigits(["", "", "", "", "", ""]);
      
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open, timerDuration, resendCooldown]);

  /**
   * Timer countdown effect
   */
  useEffect(() => {
    if (!open || remainingSeconds <= 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setLocalError("OTP code has expired. Please request a new one.");
          setState("error");
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [open, remainingSeconds]);

  /**
   * Resend cooldown countdown effect
   */
  useEffect(() => {
    if (!open || resendCooldownSeconds <= 0) {
      if (resendCooldownIntervalRef.current) {
        clearInterval(resendCooldownIntervalRef.current);
        resendCooldownIntervalRef.current = null;
      }
      setCanResend(resendCooldownSeconds === 0);
      return;
    }

    resendCooldownIntervalRef.current = setInterval(() => {
      setResendCooldownSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (resendCooldownIntervalRef.current) {
            clearInterval(resendCooldownIntervalRef.current);
            resendCooldownIntervalRef.current = null;
          }
          setCanResend(true);
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => {
      if (resendCooldownIntervalRef.current) {
        clearInterval(resendCooldownIntervalRef.current);
        resendCooldownIntervalRef.current = null;
      }
    };
  }, [open, resendCooldownSeconds]);

  /**
   * Sync external error message
   */
  useEffect(() => {
    if (errorMessage) {
      setLocalError(errorMessage);
      setState("error");
    }
  }, [errorMessage]);

  /**
   * Sync external verifying state
   */
  useEffect(() => {
    if (isVerifying) {
      setState("verifying");
    }
  }, [isVerifying]);

  /**
   * Format seconds as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Handle digit input change
   */
  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    // Update digit
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Clear error on input
    if (localError || state === "error") {
      setLocalError("");
      setState("idle");
    }

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (index === 5 && value && newDigits.every((d) => d !== "")) {
      handleSubmit(newDigits.join(""));
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace: clear current digit and move to previous
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      
      if (newDigits[index]) {
        // Clear current digit
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        // Move to previous and clear it
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
      
      return;
    }

    // Arrow Left: move to previous input
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    // Arrow Right: move to next input
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    // Enter: submit if all digits filled
    if (e.key === "Enter") {
      e.preventDefault();
      if (digits.every((d) => d !== "")) {
        handleSubmit(digits.join(""));
      }
      return;
    }

    // Escape: close modal
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
  };

  /**
   * Handle paste event - auto-fill all digits
   */
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedData = e.clipboardData.getData("text");
    const digitsOnly = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digitsOnly.length === 6) {
      const newDigits = digitsOnly.split("");
      setDigits(newDigits);
      
      // Clear error
      setLocalError("");
      setState("idle");
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      handleSubmit(digitsOnly);
    }
  };

  /**
   * Handle OTP submission
   */
  const handleSubmit = async (code: string) => {
    if (code.length !== 6 || remainingSeconds <= 0) {
      return;
    }

    setState("verifying");
    setLocalError("");

    try {
      await onVerifySuccess(code);
      setState("success");
      
      // Close modal after success animation
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setState("error");
      setLocalError(error instanceof Error ? error.message : "Invalid OTP code. Please try again.");
    }
  };

  /**
   * Handle manual submit button click
   */
  const handleManualSubmit = () => {
    const code = digits.join("");
    if (code.length === 6) {
      handleSubmit(code);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResend = async () => {
    if (!canResend) {
      return;
    }

    try {
      await onResendOTP();
      
      // Reset timer and cooldown
      setRemainingSeconds(timerDuration);
      setResendCooldownSeconds(resendCooldown);
      setCanResend(false);
      
      // Clear inputs and error
      setDigits(["", "", "", "", "", ""]);
      setLocalError("");
      setState("idle");
      
      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Failed to resend OTP. Please try again.");
      setState("error");
    }
  };

  /**
   * Determine if timer should show warning (< 60 seconds)
   */
  const isTimerWarning = remainingSeconds < 60;

  /**
   * Check if submit should be disabled
   */
  const isSubmitDisabled = 
    digits.some((d) => d === "") || 
    state === "verifying" || 
    state === "success" || 
    remainingSeconds <= 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={state !== "verifying"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {state === "success" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 animate-in fade-in zoom-in duration-300" />
                Verification Successful
              </>
            ) : (
              "Verify Your Phone Number"
            )}
          </DialogTitle>
          <DialogDescription>
            {state === "success" ? (
              "Your phone number has been verified successfully!"
            ) : (
              <>
                Enter the 6-digit code we sent to{" "}
                <span className="font-semibold text-foreground">{phoneNumber}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {state === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-medium text-green-700">Phone Verified!</p>
          </div>
        ) : (
          <>
            {/* OTP Input Grid */}
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="flex gap-2 justify-center" role="group" aria-label="OTP Code Input">
                {digits.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={state === "verifying" || state === "success"}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-semibold p-0",
                      state === "error" ? "border-red-500 focus:ring-red-500" : "",
                      state === "success" ? "border-green-500" : "",
                      digit ? "border-primary" : ""
                    )}
                    aria-label={`Digit ${index + 1} of 6`}
                    aria-invalid={state === "error"}
                    aria-describedby={state === "error" ? "otp-error" : undefined}
                  />
                ))}
              </div>

              {/* Timer Display */}
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isTimerWarning ? "text-red-600" : "text-muted-foreground"
                )}
                role="timer"
                aria-live="polite"
                aria-atomic="true"
              >
                <Clock className={cn("h-4 w-4", isTimerWarning && "animate-pulse")} />
                <span aria-label={`Time remaining: ${formatTime(remainingSeconds)}`}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>

              {/* Error Message */}
              {localError && (
                <div
                  id="otp-error"
                  className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 w-full animate-in fade-in slide-in-from-top-2 duration-200"
                  role="alert"
                  aria-live="assertive"
                >
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{localError}</span>
                </div>
              )}

              {/* Resend Button */}
              <div className="flex flex-col items-center gap-2 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend || state === "verifying"}
                  className="text-sm"
                  aria-label={
                    canResend
                      ? "Resend OTP code"
                      : `Resend available in ${resendCooldownSeconds} seconds`
                  }
                >
                  {state === "verifying" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : canResend ? (
                    "Resend Code"
                  ) : (
                    `Resend in ${resendCooldownSeconds}s`
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the code? Check your phone or wait to resend.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <DialogFooter className="sm:justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={state === "verifying"}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSubmitDisabled}
                className="min-w-[100px]"
              >
                {state === "verifying" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
