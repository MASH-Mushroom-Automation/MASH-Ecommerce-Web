"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Phone,
  Info,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Props for the TwoFactorSettings component
 */
export interface TwoFactorSettingsProps {
  /** Current 2FA enabled status */
  enabled: boolean;
  /** Whether the user's phone number is verified */
  phoneVerified: boolean;
  /** Verified phone number for display */
  phoneNumber: string;
  /** Callback to enable 2FA - must return a promise */
  onEnable: () => Promise<void>;
  /** Callback to disable 2FA - must return a promise */
  onDisable: () => Promise<void>;
  /** External loading state */
  isLoading?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * TwoFactorSettings Component
 *
 * Manages the two-factor authentication toggle with:
 * - Enable/disable toggle with smooth animation
 * - Status badge (Enabled green / Disabled gray)
 * - Tooltip when phone is not verified
 * - Confirmation dialog before disabling 2FA
 * - Loading states and error handling with toast notifications
 * - Security notice below toggle
 */
export function TwoFactorSettings({
  enabled,
  phoneVerified,
  phoneNumber,
  onEnable,
  onDisable,
  isLoading = false,
  className,
}: TwoFactorSettingsProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  const loading = isLoading || internalLoading;

  /**
   * Handle toggle change - routes to enable or disable flow
   */
  const handleToggleChange = useCallback(
    async (checked: boolean) => {
      if (loading) return;

      if (checked) {
        // Enable flow - requires verified phone
        if (!phoneVerified) return;

        setInternalLoading(true);
        try {
          await onEnable();
          toast.success("Two-factor authentication has been enabled");
        } catch {
          toast.error("Failed to enable two-factor authentication");
        } finally {
          setInternalLoading(false);
        }
      } else {
        // Disable flow - show confirmation dialog
        setShowDisableDialog(true);
      }
    },
    [loading, phoneVerified, onEnable]
  );

  /**
   * Confirm disable 2FA after dialog confirmation
   */
  const handleConfirmDisable = useCallback(async () => {
    setShowDisableDialog(false);
    setInternalLoading(true);
    try {
      await onDisable();
      toast.success("Two-factor authentication has been disabled");
    } catch {
      toast.error("Failed to disable two-factor authentication");
    } finally {
      setInternalLoading(false);
    }
  }, [onDisable]);

  /**
   * Cancel the disable dialog
   */
  const handleCancelDisable = useCallback(() => {
    setShowDisableDialog(false);
  }, []);

  const isToggleDisabled = !phoneVerified || loading;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main 2FA Toggle Section */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          {/* Shield Icon */}
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              enabled
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {enabled ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
          </div>

          {/* Label and Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="2fa-toggle"
                className="text-sm font-medium leading-none"
              >
                Enable Two-Factor Authentication
              </Label>

              {/* Status Badge */}
              {enabled ? (
                <Badge
                  className="bg-green-600 text-white hover:bg-green-600"
                  data-testid="status-badge-enabled"
                  aria-label="Two-factor authentication status: Enabled"
                >
                  Enabled
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-200 text-gray-600 hover:bg-gray-200"
                  data-testid="status-badge-disabled"
                  aria-label="Two-factor authentication status: Disabled"
                >
                  Disabled
                </Badge>
              )}
            </div>

            {/* Phone Number Display */}
            {phoneVerified && phoneNumber && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span data-testid="phone-display">{phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Switch with Tooltip */}
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2
              className="h-4 w-4 animate-spin text-muted-foreground"
              data-testid="loading-spinner"
            />
          )}

          {!phoneVerified ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <Switch
                    id="2fa-toggle"
                    checked={enabled}
                    onCheckedChange={handleToggleChange}
                    disabled={isToggleDisabled}
                    aria-label="Enable Two-Factor Authentication"
                    data-testid="2fa-toggle"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Phone number must be verified first</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Switch
              id="2fa-toggle"
              checked={enabled}
              onCheckedChange={handleToggleChange}
              disabled={loading}
              aria-label="Enable Two-Factor Authentication"
              data-testid="2fa-toggle"
            />
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700" role="note" aria-label="Security information">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p data-testid="security-notice">
          Adds an extra layer of security to your account. When enabled, you
          will need to enter a verification code from your phone in addition to
          your password when signing in.
        </p>
      </div>

      {/* Phone Not Verified Warning */}
      {!phoneVerified && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            You need to verify your phone number before enabling two-factor
            authentication.
          </p>
        </div>
      )}

      {/* Disable Confirmation Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-red-500" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disable 2FA? This will reduce the
              security of your account.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700" role="note">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Without two-factor authentication, your account will only be
              protected by your password.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDisable}
              data-testid="cancel-disable-btn"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDisable}
              data-testid="confirm-disable-btn"
            >
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
