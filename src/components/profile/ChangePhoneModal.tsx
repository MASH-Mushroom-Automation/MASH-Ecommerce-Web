"use client";

/**
 * ChangePhoneModal Component
 *
 * Modal dialog for securely changing a user's phone number.
 * Implements a multi-step flow:
 *   1. Enter new phone number
 *   2. Confirm change (masked old vs new phone)
 *   3. Verify new phone via OTP
 *   4. Success notification
 *
 * Security:
 * - OTP verification of NEW number required before change
 * - Old phone stored in Firestore audit log (phone_change_history)
 * - phoneVerifiedAt reset on change
 * - 2FA remains enabled after change (no auto-disable)
 *
 * Uses existing components: PhoneNumberInput, OTPVerificationModal
 * Uses existing hook: usePhoneVerification
 */

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Phone,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PhoneNumberInput } from "@/components/profile/PhoneNumberInput";
import type { PhoneValidationState } from "@/components/profile/PhoneNumberInput";
import { OTPVerificationModal } from "@/components/profile/OTPVerificationModal";
import {
  maskPhoneNumber,
  validatePhilippinePhoneNumber,
  formatPhoneNumber,
} from "@/lib/phone-utils";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { logPhoneChangeAudit } from "@/lib/firebase/phone-change-service";
import type { PhoneChangeMethod } from "@/lib/firebase/phone-change-service";

// ============================================================================
// Types
// ============================================================================

/** Steps in the phone change flow */
export type ChangePhoneStep =
  | "enter-phone"
  | "confirm"
  | "verify-otp"
  | "success";

/** Props for ChangePhoneModal */
export interface ChangePhoneModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Current verified phone number (E.164 format) */
  currentPhone: string;
  /** Callback when phone is successfully changed */
  onPhoneChanged: (newPhone: string) => void;
  /** Optional user ID for audit logging */
  userId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const STEP_ORDER: ChangePhoneStep[] = [
  "enter-phone",
  "confirm",
  "verify-otp",
  "success",
];

const STEP_TITLES: Record<ChangePhoneStep, string> = {
  "enter-phone": "Change Phone Number",
  confirm: "Confirm Phone Change",
  "verify-otp": "Verify New Phone",
  success: "Phone Changed",
};

const TOTAL_STEPS = 3; // Exclude success from step counter

// ============================================================================
// Component
// ============================================================================

export function ChangePhoneModal({
  open,
  onClose,
  currentPhone,
  onPhoneChanged,
  userId,
}: ChangePhoneModalProps) {
  // ---- State ----
  const [step, setStep] = useState<ChangePhoneStep>("enter-phone");
  const [newPhone, setNewPhone] = useState<string>("");
  const [phoneValidation, setPhoneValidation] =
    useState<PhoneValidationState>("idle");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Phone verification hook for new number
  const verification = usePhoneVerification({
    onSuccess: () => {
      handleOtpVerified();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Verification failed");
    },
    autoUpdateProfile: false,
  });

  // ---- Derived ----
  const formattedNewPhone = formatPhoneNumber(newPhone);
  const maskedCurrentPhone = maskPhoneNumber(currentPhone);
  const maskedNewPhone = maskPhoneNumber(newPhone);
  const stepIndex = STEP_ORDER.indexOf(step);
  const progressPercent =
    step === "success" ? 100 : ((stepIndex + 1) / TOTAL_STEPS) * 100;

  // ---- Reset State ----
  const resetState = useCallback(() => {
    setStep("enter-phone");
    setNewPhone("");
    setPhoneValidation("idle");
    setIsUpdating(false);
    setUpdateError(null);
    verification.reset();
  }, [verification]);

  // ---- Handlers ----

  /** Close and reset */
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  /** Step 1: Validate new phone and go to confirmation */
  const handlePhoneSubmit = useCallback(() => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!validatePhilippinePhoneNumber(newPhone)) {
      setPhoneValidation("error");
      toast.error("Please enter a valid Philippine mobile number");
      return;
    }

    // Check same-number
    const formattedCurrent = formatPhoneNumber(currentPhone);
    const formattedNew = formatPhoneNumber(newPhone);
    if (formattedCurrent === formattedNew) {
      toast.error("New phone number must be different from your current number");
      return;
    }

    setPhoneValidation("success");
    setStep("confirm");
  }, [newPhone, currentPhone]);

  /** Step 2: Confirm and send OTP to new phone */
  const handleConfirmAndSendOTP = useCallback(async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      await verification.sendVerification(formattedNewPhone);
      setStep("verify-otp");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send verification code";
      setUpdateError(message);
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }, [verification, formattedNewPhone]);

  /** Step 3: OTP verified - log audit and complete */
  const handleOtpVerified = useCallback(async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Log audit trail
      await logPhoneChangeAudit({
        userId: userId || "unknown",
        oldPhoneNumber: currentPhone,
        newPhoneNumber: formattedNewPhone,
        method: "otp_only" as PhoneChangeMethod,
        metadata: {
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        },
      });

      toast.success("Phone number changed successfully!");
      setStep("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update phone number";
      setUpdateError(message);
      toast.error(message);
      // Rollback: stay on verify-otp step so user can retry
      setStep("verify-otp");
    } finally {
      setIsUpdating(false);
    }
  }, [userId, currentPhone, formattedNewPhone]);

  /** Handle OTP resend */
  const handleResendOTP = useCallback(async () => {
    await verification.resendCode();
  }, [verification]);

  /** Step back navigation */
  const handleBack = useCallback(() => {
    switch (step) {
      case "confirm":
        setStep("enter-phone");
        break;
      case "verify-otp":
        setStep("confirm");
        verification.reset();
        break;
      default:
        break;
    }
  }, [step, verification]);

  // ---- Render Steps ----

  const renderStep = () => {
    switch (step) {
      // ====================================================================
      // Step 1: Enter New Phone
      // ====================================================================
      case "enter-phone":
        return (
          <div className="space-y-4" data-testid="step-enter-phone">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>
                Current: <span data-testid="current-phone-masked">{maskedCurrentPhone}</span>
              </span>
            </div>

            <PhoneNumberInput
              value={newPhone}
              onChange={setNewPhone}
              validationState={phoneValidation}
              label="New Phone Number"
              placeholder="912 345 6789"
              required
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button
                onClick={handlePhoneSubmit}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                type="button"
                data-testid="continue-btn"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        );

      // ====================================================================
      // Step 2: Confirm Change
      // ====================================================================
      case "confirm":
        return (
          <div className="space-y-4" data-testid="step-confirm">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Please confirm this change
              </span>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current phone:
                </span>
                <span className="font-medium" data-testid="confirm-old-phone">
                  {maskedCurrentPhone}
                </span>
              </div>
              <div className="border-t" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  New phone:
                </span>
                <span className="font-medium" data-testid="confirm-new-phone">
                  {maskedNewPhone}
                </span>
              </div>
            </div>

            <p
              className="text-sm text-muted-foreground"
              data-testid="confirmation-message"
            >
              Change phone from {maskedCurrentPhone} to {maskedNewPhone}?
            </p>

            <div
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground",
                "bg-muted/50 rounded-lg p-3"
              )}
            >
              <Shield className="h-4 w-4 text-blue-600" />
              <span>
                A verification code will be sent to your new phone number.
              </span>
            </div>

            {updateError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{updateError}</span>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                type="button"
                disabled={isUpdating}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmAndSendOTP}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                type="button"
                disabled={isUpdating}
                data-testid="send-otp-btn"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      // ====================================================================
      // Step 3: Verify OTP
      // ====================================================================
      case "verify-otp":
        return (
          <div className="space-y-4" data-testid="step-verify-otp">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Shield className="h-4 w-4" />
              <span>
                Enter the verification code sent to your new phone number.
              </span>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                Verification code sent to
              </p>
              <p className="font-medium mt-1" data-testid="otp-target-phone">
                {maskedNewPhone}
              </p>
            </div>

            {updateError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span data-testid="update-error">{updateError}</span>
              </div>
            )}

            {isUpdating && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating phone number...</span>
              </div>
            )}

            <OTPVerificationModal
              open={true}
              onClose={() => {
                handleBack();
              }}
              phoneNumber={formattedNewPhone}
              onVerifySuccess={(code) => {
                verification.verifyCode(code);
              }}
              onResendOTP={handleResendOTP}
              errorMessage={verification.error ?? undefined}
              isVerifying={verification.isLoading || isUpdating}
            />
          </div>
        );

      // ====================================================================
      // Step 4: Success
      // ====================================================================
      case "success":
        return (
          <div
            className="space-y-4 text-center py-4"
            data-testid="step-success"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Phone Number Updated</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your phone number has been changed to {maskedNewPhone}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground",
                "bg-muted/50 rounded-lg p-3 justify-center"
              )}
            >
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your phone verification timestamp has been updated.</span>
            </div>
            <DialogFooter className="pt-4 justify-center">
              <Button
                onClick={() => {
                  onPhoneChanged(formattedNewPhone);
                  handleClose();
                }}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                type="button"
                data-testid="done-btn"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="change-phone-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {STEP_TITLES[step]}
          </DialogTitle>
          {step !== "success" && (
            <DialogDescription>
              Step {stepIndex + 1} of {TOTAL_STEPS}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E392A] transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Phone change progress: step ${stepIndex + 1} of ${TOTAL_STEPS}`}
          />
        </div>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

export default ChangePhoneModal;
