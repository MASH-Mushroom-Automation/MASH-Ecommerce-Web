"use client";

import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface AccountRecoveryLinkProps {
  /** Callback fired when the user clicks the recovery link */
  onRecoveryClick: () => void;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AccountRecoveryLink
 *
 * Small inline link displayed below 2FA verification inputs.
 * Triggers the account recovery flow (email verification + temporary
 * 2FA disable) when the user cannot access their phone.
 */
export function AccountRecoveryLink({
  onRecoveryClick,
  className,
}: AccountRecoveryLinkProps) {
  return (
    <button
      type="button"
      onClick={onRecoveryClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
        "hover:text-primary hover:underline focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm",
        "transition-colors",
        className,
      )}
      data-testid="account-recovery-link"
    >
      <Shield className="h-3.5 w-3.5" />
      <span>Can&apos;t access your phone?</span>
    </button>
  );
}
