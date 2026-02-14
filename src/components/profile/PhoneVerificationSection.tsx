/**
 * PhoneVerificationSection Component
 *
 * Feature-flag-gated wrapper for the phone verification UI.
 * Renders nothing when NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION is false.
 * When enabled, renders the complete phone verification flow:
 * - Current phone display with masked number
 * - Verified / Unverified badge
 * - Edit button to enter editing mode
 * - PhoneNumberInput for editing
 * - Verify & Save / Save Without Verify / Cancel buttons
 * - OTPVerificationModal trigger
 */

'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Phone,
  Shield,
  Edit,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PhoneNumberInput } from '@/components/profile/PhoneNumberInput';
import { OTPVerificationModal } from '@/components/profile/OTPVerificationModal';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { maskPhoneNumber } from '@/lib/phone-utils';
import { isPhoneVerificationEnabled } from '@/lib/feature-flags';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface PhoneVerificationUser {
  uid?: string;
  phone?: string;
  phoneNumber?: string;
}

export interface PhoneVerificationSectionProps {
  /** Current authenticated user */
  user: PhoneVerificationUser | null;
  /** Whether the phone is already verified */
  phoneVerified: boolean;
  /** Current phone number (E.164 format) */
  phoneNumber: string;
  /** Callback when phone is verified and saved */
  onPhoneVerified: (verifiedPhone: string) => void;
  /** Callback when phone is saved without verification */
  onPhoneSaved?: (phone: string) => void;
  /** Callback when phone number input changes */
  onPhoneChange?: (phone: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export function PhoneVerificationSection({
  user,
  phoneVerified,
  phoneNumber,
  onPhoneVerified,
  onPhoneSaved,
  onPhoneChange,
}: PhoneVerificationSectionProps) {
  // Feature flag gate - render nothing if disabled
  if (!isPhoneVerificationEnabled()) {
    return null;
  }

  return (
    <PhoneVerificationSectionInner
      user={user}
      phoneVerified={phoneVerified}
      phoneNumber={phoneNumber}
      onPhoneVerified={onPhoneVerified}
      onPhoneSaved={onPhoneSaved}
      onPhoneChange={onPhoneChange}
    />
  );
}

/**
 * Inner component that contains hooks (separated to avoid conditional hook calls).
 */
function PhoneVerificationSectionInner({
  user,
  phoneVerified,
  phoneNumber: initialPhoneNumber,
  onPhoneVerified,
  onPhoneSaved,
  onPhoneChange,
}: PhoneVerificationSectionProps) {
  const [localPhone, setLocalPhone] = useState(initialPhoneNumber);
  const [isEditing, setIsEditing] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Phone verification hook
  const phoneVerification = usePhoneVerification({
    onSuccess: (verifiedPhone: string) => {
      setShowOTPModal(false);
      setIsEditing(false);
      onPhoneVerified(verifiedPhone);
    },
    onError: (error: Error) => {
      console.error('[PhoneVerificationSection] Verification error:', error);
    },
    autoUpdateProfile: false,
  });

  const handlePhoneChange = (value: string) => {
    setLocalPhone(value);
    onPhoneChange?.(value);
  };

  const handleVerifyPhone = async () => {
    if (!localPhone || localPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number first');
      return;
    }
    setShowOTPModal(true);
    await phoneVerification.sendVerification(localPhone);
  };

  const handleOTPVerifySuccess = async (code: string) => {
    await phoneVerification.verifyCode(code);
  };

  const handleOTPResend = async () => {
    await phoneVerification.resendCode();
  };

  const handleSaveWithoutVerify = async () => {
    const cleanPhone = localPhone.trim();
    if (!cleanPhone) {
      toast.error('Phone number is required');
      return;
    }
    setSaveLoading(true);
    try {
      onPhoneSaved?.(cleanPhone);
      setIsEditing(false);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalPhone(initialPhoneNumber);
    phoneVerification.reset();
  };

  return (
    <div className="md:col-span-2" data-testid="phone-verification-section">
      <div className="flex items-center justify-between mb-1">
        <Label className="text-sm font-medium text-gray-700">
          Phone Number
          <span className="text-red-500 ml-1">*</span>
          <span className="text-xs text-gray-500 ml-2">
            (Required for delivery)
          </span>
        </Label>
        {localPhone && !isEditing && (
          <div className="flex items-center gap-1.5">
            {phoneVerified ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-xs"
                data-testid="verified-badge"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                data-testid="unverified-badge"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-1 space-y-3">
          <PhoneNumberInput
            value={localPhone}
            onChange={handlePhoneChange}
            validationState={
              phoneVerification.isLoading
                ? 'loading'
                : phoneVerification.error
                  ? 'error'
                  : phoneVerification.isVerified
                    ? 'success'
                    : 'idle'
            }
            error={phoneVerification.error || undefined}
            disabled={saveLoading || phoneVerification.isLoading}
            required
            label=""
            placeholder="912 345 6789"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleVerifyPhone}
              disabled={
                saveLoading ||
                phoneVerification.isLoading ||
                !localPhone ||
                localPhone.replace(/\D/g, '').length < 10
              }
              size="sm"
              className="bg-[#1E392A] hover:bg-[#2d5a42]"
            >
              {phoneVerification.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Shield className="h-4 w-4 mr-1" />
              )}
              Verify &amp; Save
            </Button>
            <Button
              onClick={handleSaveWithoutVerify}
              disabled={saveLoading || phoneVerification.isLoading}
              size="sm"
              variant="outline"
            >
              {saveLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Without Verify'
              )}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saveLoading || phoneVerification.isLoading}
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-900" data-testid="phone-display">
              {localPhone
                ? maskPhoneNumber(localPhone)
                : 'No phone number set'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {localPhone && !phoneVerified && (
              <Button
                onClick={() => {
                  setIsEditing(true);
                  handleVerifyPhone();
                }}
                size="sm"
                variant="ghost"
                className="text-amber-600 hover:bg-amber-50 text-xs"
                data-testid="verify-button"
              >
                <Shield className="h-3.5 w-3.5 mr-1" />
                Verify
              </Button>
            )}
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="ghost"
              className="text-[#1E392A] hover:bg-[#1E392A]/10"
              data-testid="edit-phone-button"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {!localPhone && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Phone number is required for Lalamove delivery coordination
        </p>
      )}

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        open={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          phoneVerification.reset();
        }}
        phoneNumber={localPhone}
        onVerifySuccess={handleOTPVerifySuccess}
        onResendOTP={handleOTPResend}
        errorMessage={phoneVerification.error || undefined}
        isVerifying={phoneVerification.state === 'verifying'}
      />
    </div>
  );
}

export default PhoneVerificationSection;
