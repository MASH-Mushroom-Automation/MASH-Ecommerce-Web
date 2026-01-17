"use client";

/**
 * Forgot Password Page - Backend Authentication
 *
 * Sends password reset email via NestJS backend.
 * Uses 6-digit verification code for password reset.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthApi } from "@/lib/api/auth";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
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
      // Call backend API for password reset
      await AuthApi.forgotPassword({
        email: values.email,
      });

      // Store email for reset page
      sessionStorage.setItem("resetPasswordEmail", values.email);

      // Show success state
      setSentToEmail(values.email);
      setEmailSent(true);

      toast.success("Reset code sent!", {
        description: "Check your email for the 6-digit verification code.",
      });
    } catch (err) {
      console.error("Forgot password error:", err);

      // For security, show success even if email not found
      // This prevents email enumeration attacks
      const errorMessage =
        err instanceof Error ? err.message.toLowerCase() : "";

      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("no user")
      ) {
        // Store email anyway (for UX consistency)
        sessionStorage.setItem("resetPasswordEmail", values.email);
        setSentToEmail(values.email);
        setEmailSent(true);

        toast.success("Reset code sent!", {
          description:
            "If this email is registered, you'll receive a reset code.",
        });
      } else {
        toast.error("Request failed", {
          description:
            err instanceof Error
              ? err.message
              : "Unable to process request. Please try again.",
        });
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
          We&apos;ve sent a 6-digit verification code to:
          <br />
          <strong className="text-foreground">{sentToEmail}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the code on the next page to reset your password. The code will
          expire in 15 minutes.
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push("/reset-password")}
          >
            Enter Reset Code
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
          Enter your email address and we&apos;ll send you a 6-digit code.
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
            {isSubmitting ? "Sending..." : "Send Reset Code"}
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
