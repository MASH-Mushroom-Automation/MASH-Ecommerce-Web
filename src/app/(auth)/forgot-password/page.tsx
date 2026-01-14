"use client";

/**
 * Forgot Password Page - Firebase Authentication
 *
 * Sends password reset email via Firebase Auth.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Mail, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordForm) => {
    try {
      // Send password reset email via Firebase
      await resetPassword(values.email);

      // Show success state (toast already shown by AuthContext)
      setSentToEmail(values.email);
      setEmailSent(true);
    } catch (err: unknown) {
      // Error already handled by AuthContext with toast
      console.error("Forgot password error (handled):", err);

      // For security, still show success for user-not-found
      // This prevents email enumeration attacks
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === "auth/user-not-found") {
        setSentToEmail(values.email);
        setEmailSent(true);
      }
    }
  };

  const handleCancel = () => {
    router.push("/login");
  };

  // Success state - show confirmation
  if (emailSent) {
    return (
      <div className="bg-card rounded-lg shadow-md p-8 text-center">
        <div className="bg-green-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Check your email
        </h2>
        <p className="text-muted-foreground mb-6">
          We&apos;ve sent a password reset link to:
          <br />
          <strong className="text-foreground">{sentToEmail}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Click the link in the email to reset your password. The link will
          expire in 1 hour.
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Back to Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailSent(false);
              setSentToEmail("");
            }}
          >
            Try a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Card */}
      <div className="bg-card rounded-lg shadow-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary rounded-full p-4">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Reset your Password
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Enter your email address and we&apos;ll send you a reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="w-full"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          {/* Cancel Button */}
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="w-full py-6 border-primary text-primary hover:bg-primary/10"
          >
            Cancel
          </Button>
        </form>
      </div>
    </>
  );
}
