"use client";

/**
 * Reset Password Page - Backend Authentication
 * 
 * Allows users to reset their password with:
 * 1. 6-digit verification code (sent via email)
 * 2. New password + confirmation
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Eye, EyeOff, Check, X as XIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/lib/api/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { getPasswordRequirements } from '@/lib/auth/password';

const ResetSchema = z
  .object({
    code: z.string().length(6, "Enter the 6-digit code"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof ResetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });

  const codeValue = watch("code");

  // Get email from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetPasswordEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("No reset request found", {
        description: "Please start the password reset process again.",
      });
      router.push("/forgot-password");
    }
  }, [router]);

  const handleResendCode = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await AuthApi.forgotPassword({ email });
      toast.success("Code resent!", {
        description: "Check your email for the new verification code.",
      });
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code", {
        description: "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: ResetForm) => {
    if (!email) {
      toast.error("Email not found", {
        description: "Please start the password reset process again.",
      });
      router.push("/forgot-password");
      return;
    }

    try {
      // Call backend API to reset password
      await AuthApi.resetPassword({
        email,
        code: values.code,
        newPassword: values.password,
      });

      // Clear stored email
      sessionStorage.removeItem("resetPasswordEmail");

      toast.success("Password updated!", {
        description: "You can now sign in with your new password.",
      });
      
      router.push("/reset-success");
    } catch (error) {
      console.error("Reset password error:", error);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Check for specific errors
      if (errorMessage.toLowerCase().includes("invalid") || 
          errorMessage.toLowerCase().includes("expired")) {
        toast.error("Invalid or expired code", {
          description: "Please request a new code and try again.",
          action: {
            label: "Resend",
            onClick: () => void handleResendCode(),
          },
        });
      } else {
        toast.error("Reset failed", {
          description: errorMessage,
        });
      }
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("resetPasswordEmail");
    router.push("/login");
  };

  const passwordReqs = getPasswordRequirements(password);

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{3})(.*)(@.*)/, "$1*****$3")
    : "";

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
          Create New Password
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Enter the 6-digit code sent to <strong>{maskedEmail}</strong>
          <br />
          and create your new password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Verification Code
            </label>
            <div className="flex justify-center mb-2">
              <InputOTP
                maxLength={6}
                value={codeValue}
                onChange={(value) => setValue("code", value)}
                disabled={isSubmitting}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {errors.code && (
              <p className="mt-1 text-sm text-destructive text-center">
                {errors.code.message}
              </p>
            )}
            <p className="text-center text-sm text-muted-foreground mt-2">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary hover:underline font-medium disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                onInput={(e) => setPassword(e.currentTarget.value)}
                className="w-full pr-10"
                placeholder="Create a new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {password && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border space-y-1">
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.minLength ? "text-green-600" : "text-muted-foreground"}`}>
                  {passwordReqs.minLength ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                  <span>At least 6 characters</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.hasUppercase ? "text-green-600" : "text-muted-foreground"}`}>
                  {passwordReqs.hasUppercase ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                  <span>One uppercase letter (recommended)</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                  {passwordReqs.hasNumber ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                  <span>One number (recommended)</span>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Reset Button */}
          <Button
            type="submit"
            disabled={isSubmitting || codeValue.length !== 6}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
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
