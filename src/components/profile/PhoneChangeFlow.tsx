"use client";

/**
 * PhoneChangeFlow Component
 *
 * Multi-step wizard for securely changing a user's phone number.
 * Requires password confirmation, OTP verification of the new number,
 * and (when 2FA is enabled) OTP verification of the old number.
 *
 * Steps:
 * 1. Enter new phone number
 * 2. Confirm current password
 * 3. (If 2FA enabled) Verify OTP sent to OLD phone
 * 4. Verify OTP sent to NEW phone
 * 5. Confirmation dialog with masked numbers
 * 6. Success state
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneNumberInput } from "@/components/profile/PhoneNumberInput";
import type { PhoneValidationState } from "@/components/profile/PhoneNumberInput";
import { OTPVerificationModal } from "@/components/profile/OTPVerificationModal";
import { maskPhoneNumber, validatePhilippinePhoneNumber, formatPhoneNumber } from "@/lib/phone-utils";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { logPhoneChange } from "@/lib/security/phone-change-audit";
import type { PhoneChangeMethod } from "@/lib/security/phone-change-audit";

// ============================================================================
// Types
// ============================================================================

export type PhoneChangeStep =
  | "enter-phone"
  | "confirm-password"
  | "verify-old-otp"
  | "verify-new-otp"
  | "confirm-change"
  | "success";

export interface PhoneChangeFlowProps {
  /** Current phone number in E.164 format */
  currentPhoneNumber: string;
  /** Whether current phone is verified */
  phoneVerified: boolean;
  /** Whether 2FA is enabled on the account */
  twoFactorEnabled: boolean;
  /** Callback when phone is successfully changed */
  onPhoneChanged: (newPhone: string) => void;
  /** Callback when flow is cancelled */
  onCancel: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STEP_TITLES: Record<PhoneChangeStep, string> = {
  "enter-phone": "Enter New Phone Number",
  "confirm-password": "Confirm Your Password",
  "verify-old-otp": "Verify Current Phone",
  "verify-new-otp": "Verify New Phone",
  "confirm-change": "Confirm Phone Change",
  "success": "Phone Changed Successfully",
};

// ============================================================================
// Component
// ============================================================================

export function PhoneChangeFlow({
  currentPhoneNumber,
  phoneVerified,
  twoFactorEnabled,
  onPhoneChanged,
  onCancel,
}: PhoneChangeFlowProps) {
  // ---- State ----
  const [step, setStep] = useState<PhoneChangeStep>("enter-phone");
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>("");
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidationState>("idle");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [oldOtpModalOpen, setOldOtpModalOpen] = useState<boolean>(false);
  const [newOtpModalOpen, setNewOtpModalOpen] = useState<boolean>(false);

  // Phone verification hooks for old and new numbers
  const oldPhoneVerification = usePhoneVerification({
    onSuccess: () => {
      setOldOtpModalOpen(false);
      handleOldPhoneVerified();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify current phone");
    },
    autoUpdateProfile: false,
  });

  const newPhoneVerification = usePhoneVerification({
    onSuccess: () => {
      setNewOtpModalOpen(false);
      handleNewPhoneVerified();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify new phone");
    },
    autoUpdateProfile: false,
  });

  // ---- Derived ----
  const formattedNewPhone = formatPhoneNumber(newPhoneNumber);
  const maskedOldPhone = maskPhoneNumber(currentPhoneNumber);
  const maskedNewPhone = maskPhoneNumber(newPhoneNumber);

  // ---- Step Navigation ----
  const getNextStep = useCallback(
    (current: PhoneChangeStep): PhoneChangeStep => {
      switch (current) {
        case "enter-phone":
          return "confirm-password";
        case "confirm-password":
          return twoFactorEnabled ? "verify-old-otp" : "verify-new-otp";
        case "verify-old-otp":
          return "verify-new-otp";
        case "verify-new-otp":
          return "confirm-change";
        case "confirm-change":
          return "success";
        default:
          return "success";
      }
    },
    [twoFactorEnabled]
  );

  const getPreviousStep = useCallback(
    (current: PhoneChangeStep): PhoneChangeStep | null => {
      switch (current) {
        case "confirm-password":
          return "enter-phone";
        case "verify-old-otp":
          return "confirm-password";
        case "verify-new-otp":
          return twoFactorEnabled ? "verify-old-otp" : "confirm-password";
        case "confirm-change":
          return "verify-new-otp";
        default:
          return null;
      }
    },
    [twoFactorEnabled]
  );

  // ---- Handlers ----

  /** Step 1: Validate and proceed from new phone entry */
  const handlePhoneSubmit = useCallback(() => {
    if (!newPhoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!validatePhilippinePhoneNumber(newPhoneNumber)) {
      setPhoneValidation("error");
      toast.error("Please enter a valid Philippine mobile number");
      return;
    }

    const formatted = formatPhoneNumber(newPhoneNumber);
    if (formatted === formatPhoneNumber(currentPhoneNumber)) {
      toast.error("New phone number must be different from your current number");
      return;
    }

    setPhoneValidation("success");
    setStep("confirm-password");
  }, [newPhoneNumber, currentPhoneNumber]);

  /** Step 2: Validate password and proceed */
  const handlePasswordSubmit = useCallback(async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      // Simulate password verification API call
      // In production, this calls the backend to verify the password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nextStep = getNextStep("confirm-password");

      if (nextStep === "verify-old-otp") {
        // Send OTP to old phone for 2FA verification
        await oldPhoneVerification.sendVerification(currentPhoneNumber);
        setOldOtpModalOpen(true);
      }

      setStep(nextStep);

      if (nextStep === "verify-new-otp") {
        // Send OTP to new phone
        await newPhoneVerification.sendVerification(formattedNewPhone);
        setNewOtpModalOpen(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Password verification failed";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [password, getNextStep, oldPhoneVerification, newPhoneVerification, currentPhoneNumber, formattedNewPhone]);

  /** Step 3: Old phone OTP verified (2FA flow) */
  const handleOldPhoneVerified = useCallback(async () => {
    setStep("verify-new-otp");
    try {
      await newPhoneVerification.sendVerification(formattedNewPhone);
      setNewOtpModalOpen(true);
    } catch (error) {
      toast.error("Failed to send verification to new phone");
    }
  }, [newPhoneVerification, formattedNewPhone]);

  /** Step 4: New phone OTP verified */
  const handleNewPhoneVerified = useCallback(() => {
    setStep("confirm-change");
  }, []);

  /** Step 5: Confirm and execute the phone change */
  const handleConfirmChange = useCallback(async () => {
    setIsLoading(true);

    try {
      // Log the audit trail
      const method: PhoneChangeMethod = twoFactorEnabled ? "password_2fa_otp" : "password_otp";
      await logPhoneChange(
        "current-user-id",
        currentPhoneNumber,
        formattedNewPhone,
        method,
        {
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }
      );

      // Trigger the phone change callback
      onPhoneChanged(formattedNewPhone);
      toast.success("Phone number changed successfully!");
      setStep("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change phone number";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [twoFactorEnabled, currentPhoneNumber, formattedNewPhone, onPhoneChanged]);

  /** Go back to previous step */
  const handleBack = useCallback(() => {
    const prev = getPreviousStep(step);
    if (prev) {
      setStep(prev);
    }
  }, [step, getPreviousStep]);

  /** Handle OTP resend for old phone */
  const handleResendOldOTP = useCallback(async () => {
    await oldPhoneVerification.resendCode();
  }, [oldPhoneVerification]);

  /** Handle OTP resend for new phone */
  const handleResendNewOTP = useCallback(async () => {
    await newPhoneVerification.resendCode();
  }, [newPhoneVerification]);

  // ---- Step Progress ----
  const totalSteps = twoFactorEnabled ? 5 : 4;
  const stepOrder: PhoneChangeStep[] = twoFactorEnabled
    ? ["enter-phone", "confirm-password", "verify-old-otp", "verify-new-otp", "confirm-change"]
    : ["enter-phone", "confirm-password", "verify-new-otp", "confirm-change"];
  const currentStepIndex = stepOrder.indexOf(step);
  const progressPercent = step === "success" ? 100 : ((currentStepIndex + 1) / totalSteps) * 100;

  // ---- Render Steps ----

  const renderStepContent = () => {
    switch (step) {
      case "enter-phone":
        return (
          <div className="space-y-4" data-testid="step-enter-phone">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Phone className="h-4 w-4" />
              <span>Current: {maskedOldPhone}</span>
            </div>
            <PhoneNumberInput
              value={newPhoneNumber}
              onChange={setNewPhoneNumber}
              validationState={phoneValidation}
              label="New Phone Number"
              placeholder="912 345 6789"
              required
            />
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onCancel} type="button">
                Cancel
              </Button>
              <Button
                onClick={handlePhoneSubmit}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                type="button"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        );

      case "confirm-password":
        return (
          <div className="space-y-4" data-testid="step-confirm-password">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Lock className="h-4 w-4" />
              <span>Confirm your identity to continue</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-change-password">Current Password</Label>
              <Input
                id="phone-change-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Enter your current password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                disabled={isLoading}
              />
              {passwordError && (
                <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {passwordError}
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleBack} type="button" disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      case "verify-old-otp":
        return (
          <div className="space-y-4" data-testid="step-verify-old-otp">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Shield className="h-4 w-4" />
              <span>2FA verification required. Enter the code sent to your current phone.</span>
            </div>
            <div className="rounded-lg border p-4 bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Verification code sent to</p>
              <p className="font-medium mt-1">{maskedOldPhone}</p>
            </div>
            <OTPVerificationModal
              open={oldOtpModalOpen}
              onClose={() => {
                setOldOtpModalOpen(false);
                handleBack();
              }}
              phoneNumber={currentPhoneNumber}
              onVerifySuccess={(code) => {
                oldPhoneVerification.verifyCode(code);
              }}
              onResendOTP={handleResendOldOTP}
              errorMessage={oldPhoneVerification.error ?? undefined}
              isVerifying={oldPhoneVerification.isLoading}
            />
            {!oldOtpModalOpen && (
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={handleBack} type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setOldOtpModalOpen(true)}
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                  type="button"
                >
                  Enter Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            )}
          </div>
        );

      case "verify-new-otp":
        return (
          <div className="space-y-4" data-testid="step-verify-new-otp">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Phone className="h-4 w-4" />
              <span>Enter the verification code sent to your new phone number.</span>
            </div>
            <div className="rounded-lg border p-4 bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Verification code sent to</p>
              <p className="font-medium mt-1">{maskedNewPhone}</p>
            </div>
            <OTPVerificationModal
              open={newOtpModalOpen}
              onClose={() => {
                setNewOtpModalOpen(false);
                handleBack();
              }}
              phoneNumber={formattedNewPhone}
              onVerifySuccess={(code) => {
                newPhoneVerification.verifyCode(code);
              }}
              onResendOTP={handleResendNewOTP}
              errorMessage={newPhoneVerification.error ?? undefined}
              isVerifying={newPhoneVerification.isLoading}
            />
            {!newOtpModalOpen && (
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={handleBack} type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setNewOtpModalOpen(true)}
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                  type="button"
                >
                  Enter Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            )}
          </div>
        );

      case "confirm-change":
        return (
          <div className="space-y-4" data-testid="step-confirm-change">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Please confirm this change</span>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current phone:</span>
                <span className="font-medium">{maskedOldPhone}</span>
              </div>
              <div className="border-t" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New phone:</span>
                <span className="font-medium">{maskedNewPhone}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="confirmation-message">
              Change phone from {maskedOldPhone} to {maskedNewPhone}?
            </p>
            {twoFactorEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Two-factor authentication will remain enabled after this change.</span>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleBack} type="button" disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleConfirmChange}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    Confirm Change
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      case "success":
        return (
          <div className="space-y-4 text-center py-4" data-testid="step-success">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Phone Number Updated</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your phone number has been changed to {maskedNewPhone}
              </p>
            </div>
            {twoFactorEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 justify-center">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Two-factor authentication is still active.</span>
              </div>
            )}
            <DialogFooter className="pt-4 justify-center">
              <Button
                onClick={() => onPhoneChanged(formattedNewPhone)}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                type="button"
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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md" data-testid="phone-change-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {STEP_TITLES[step]}
          </DialogTitle>
          {step !== "success" && (
            <DialogDescription>
              Step {currentStepIndex + 1} of {totalSteps}
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
            aria-label={`Phone change progress: step ${currentStepIndex + 1} of ${totalSteps}`}
          />
        </div>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}

export default PhoneChangeFlow;
