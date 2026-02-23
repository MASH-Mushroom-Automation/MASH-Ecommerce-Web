"use client";

/**
 * Account Recovery Page
 *
 * Multi-step flow for users who cannot access their phone for 2FA verification.
 * Uses the useAccountRecovery hook to manage the flow:
 * 1. Enter email to receive recovery code
 * 2. Enter the recovery code from email
 * 3. 2FA is disabled, backup codes are shown
 *
 * Linked from the login page's "Can't access your phone?" link.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldOff, Mail, KeyRound, CheckCircle, Copy, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccountRecovery } from "@/hooks/useAccountRecovery";
import { formatBackupCode } from "@/lib/security/backup-codes";

// ============================================================================
// Validation schemas
// ============================================================================

const EmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type EmailForm = z.infer<typeof EmailSchema>;

const CodeSchema = z.object({
  code: z.string().min(4, "Enter the recovery code from your email"),
});
type CodeForm = z.infer<typeof CodeSchema>;

// ============================================================================
// Page Component
// ============================================================================

export default function AccountRecoveryPage() {
  const router = useRouter();
  const {
    recoveryStep,
    isLoading,
    error,
    backupCodes,
    sendRecoveryEmail,
    verifyRecoveryCode,
    disableTwoFactorViaRecovery,
    reset,
  } = useAccountRecovery();

  const [sentEmail, setSentEmail] = useState("");

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(CodeSchema),
    defaultValues: { code: "" },
  });

  // ---------- Step 1: Send recovery email ----------
  const handleSendEmail = async (values: EmailForm) => {
    try {
      await sendRecoveryEmail(values.email);
      setSentEmail(values.email);
    } catch {
      // Error is handled by the hook (toast + state)
    }
  };

  // ---------- Step 2: Verify recovery code ----------
  const handleVerifyCode = async (values: CodeForm) => {
    try {
      const verified = await verifyRecoveryCode(values.code);
      if (verified) {
        await disableTwoFactorViaRecovery();
      }
    } catch {
      // Error is handled by the hook
    }
  };

  // ---------- Copy backup codes ----------
  const handleCopyBackupCodes = () => {
    const formatted = backupCodes.map(formatBackupCode).join("\n");
    navigator.clipboard.writeText(formatted);
    toast.success("Backup codes copied to clipboard");
  };

  // ---------- Step 3: Backup codes shown (complete) ----------
  if (recoveryStep === "codes-generated" || recoveryStep === "complete") {
    return (
      <div className="bg-card rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/10 rounded-full p-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Account Recovered
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Two-factor authentication has been temporarily disabled for 7 days.
          Save these backup codes in a secure location.
        </p>

        {backupCodes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Backup Codes
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyBackupCodes}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="text-center py-1 text-foreground"
                >
                  {formatBackupCode(code)}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Each code can only be used once. Store them somewhere safe.
            </p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={() => router.push("/login")}
        >
          Return to Login
        </Button>
      </div>
    );
  }

  // ---------- Step 2: Verify code ----------
  if (recoveryStep === "email-sent" || recoveryStep === "verifying") {
    return (
      <div className="bg-card rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 rounded-full p-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Enter Recovery Code
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-2">
          We sent a verification code to:
        </p>
        <p className="text-center font-medium text-foreground mb-6">
          {sentEmail}
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Recovery Code
            </label>
            <Input
              id="code"
              type="text"
              {...codeForm.register("code")}
              className="w-full text-center text-lg tracking-wider"
              placeholder="Enter code"
              autoComplete="one-time-code"
            />
            {codeForm.formState.errors.code && (
              <p className="mt-1 text-sm text-destructive">
                {codeForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
          >
            {isLoading ? "Verifying..." : "Verify and Recover Account"}
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset();
                setSentEmail("");
                codeForm.reset();
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={async () => {
                try {
                  await sendRecoveryEmail(sentEmail);
                } catch {
                  // Handled by hook
                }
              }}
            >
              <Mail className="w-4 h-4 mr-1" />
              Resend
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ---------- Step 1: Enter email (idle) ----------
  return (
    <div className="bg-card rounded-lg shadow-md p-8">
      <div className="flex justify-center mb-6">
        <div className="bg-primary rounded-full p-4">
          <ShieldOff className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-foreground mb-2">
        Account Recovery
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8">
        Can&apos;t access your phone for 2FA? Enter your email and we&apos;ll
        send a recovery code to temporarily disable two-factor authentication.
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            {...emailForm.register("email")}
            className="w-full"
            placeholder="Enter your email"
          />
          {emailForm.formState.errors.email && (
            <p className="mt-1 text-sm text-destructive">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
        >
          {isLoading ? "Sending..." : "Send Recovery Code"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full py-6 border-primary text-primary hover:bg-primary/10"
          onClick={() => router.push("/login")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
      </form>
    </div>
  );
}
