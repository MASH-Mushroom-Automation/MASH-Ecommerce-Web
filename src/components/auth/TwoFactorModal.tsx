"use client";

import React from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { OTPVerificationModal } from "@/components/profile/OTPVerificationModal";

interface TwoFactorModalProps {
  open: boolean;
  phoneNumber: string;
  errorMessage: string;
  isVerifying: boolean;
  rememberDevice: boolean;
  onRememberDeviceChange: (checked: boolean) => void;
  onVerifySuccess: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onClose: () => void;
}

export function TwoFactorModal({
  open,
  phoneNumber,
  errorMessage,
  isVerifying,
  rememberDevice,
  onRememberDeviceChange,
  onVerifySuccess,
  onResend,
  onClose,
}: TwoFactorModalProps) {
  return (
    <>
      <OTPVerificationModal
        open={open}
        onClose={onClose}
        phoneNumber={phoneNumber}
        onVerifySuccess={onVerifySuccess}
        onResendOTP={onResend}
        errorMessage={errorMessage}
        isVerifying={isVerifying}
      />

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center pb-32 pointer-events-none"
          aria-hidden="true"
        >
          <div className="pointer-events-auto bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm w-full mx-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) =>
                  onRememberDeviceChange(!!checked)
                }
                data-testid="remember-device-checkbox"
              />
              <label
                htmlFor="remember-device"
                className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
              >
                <Shield className="w-3 h-3 inline mr-1" />
                Remember this device for 30 days
              </label>
            </div>

            <div className="text-center">
              <Link
                href="/account-recovery"
                className="text-xs text-primary hover:underline"
                data-testid="2fa-recovery-link"
              >
                Can&apos;t access your phone?
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
