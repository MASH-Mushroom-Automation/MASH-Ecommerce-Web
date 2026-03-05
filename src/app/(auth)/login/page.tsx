"use client";

/**
 * Login Page - Backend & Firebase Authentication
 *
 * Supports two sign-in methods:
 * - Email/Password (via NestJS Backend)
 * - Google OAuth (via Firebase)
 *
 * All auth logic is extracted to useLogin hook.
 * 2FA modal is extracted to TwoFactorModal component.
 */

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  User,
  Mail,
  Lock,
  X,
  AlertCircle,
  Check,
  X as XIcon,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Controller } from "react-hook-form";
import { TwoFactorModal } from "@/components/auth/TwoFactorModal";
import { useLogin, getEmailStatus } from "@/hooks/useLogin";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting,
    setValue,
    clearErrors,
    onSubmit,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    authLoading,
    contextualMessage,
    verifyParam,
    verifiedParam,
    resendVerificationEmail,
    show2FAModal,
    twoFAPhoneNumber,
    twoFAError,
    isVerifying2FA,
    rememberDevice,
    setRememberDevice,
    handle2FAVerifySuccess,
    handle2FAResend,
    handle2FAClose,
  } = useLogin();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 sm:py-8 md:py-12">
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 md:p-12 overflow-hidden">
          <div className="relative">
            {/* Clear/Home Button */}
            <Link
              href="/"
              className="absolute top-0 right-0 p-2 hover:bg-muted/30 rounded-full transition-colors"
              title="Go to home"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </Link>

            {/* User Icon */}
            <div className="flex justify-center mb-4 sm:mb-6 pt-2">
              <div className="bg-primary rounded-full p-3 sm:p-4">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-1 sm:mb-2">
              Sign in to your account
            </h2>
            <p className="text-center text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="pt-2">
            {/* Contextual Message Alert */}
            {contextualMessage && (
              <Alert
                className={`mb-4 sm:mb-6 ${
                  verifyParam === "true"
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : verifiedParam === "true"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-primary/10 border-primary/30"
                }`}
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    verifyParam === "true"
                      ? "text-yellow-600"
                      : verifiedParam === "true"
                        ? "text-green-600"
                        : "text-primary"
                  }`}
                />
                <AlertDescription
                  className={`font-medium text-xs sm:text-sm ${
                    verifyParam === "true"
                      ? "text-yellow-600"
                      : verifiedParam === "true"
                        ? "text-green-600"
                        : "text-primary"
                  }`}
                >
                  {contextualMessage}
                  {verifyParam === "true" && (
                    <button
                      onClick={() => resendVerificationEmail()}
                      className="ml-2 underline hover:no-underline"
                    >
                      Resend email
                    </button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Password Sign-In Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4 md:space-y-5"
              noValidate
            >
              {/* Loading Overlay */}
              {(isSubmitting || authLoading) && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Signing you in...
                    </p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    setEmail(value);
                    setValue("email", value, { shouldValidate: true });
                    if (errors.email && value) {
                      clearErrors("email");
                    }
                  }}
                  className={`w-full ${errors.email ? "border-destructive focus:border-destructive" : ""}`}
                  placeholder="Enter your email"
                  icon={<Mail className="h-5 w-5" />}
                  disabled={isSubmitting || authLoading}
                  autoComplete="email"
                />

                {/* Email Validation Indicator */}
                {email && (
                  <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        getEmailStatus(email).isValid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {getEmailStatus(email).isValid ? (
                        <Check className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <XIcon className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span>{getEmailStatus(email).message}</span>
                    </div>
                  </div>
                )}

                {errors.email && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    onInput={(e) => {
                      const value = e.currentTarget.value;
                      setPassword(value);
                      if (errors.password && value) {
                        clearErrors("password");
                      }
                    }}
                    className={`w-full pr-10 ${errors.password ? "border-destructive focus:border-destructive" : ""}`}
                    placeholder="Enter your password"
                    icon={<Lock className="h-5 w-5" />}
                    disabled={isSubmitting || authLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                    )}
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
                  >
                    Remember Me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-semibold transition-all duration-200 hover:shadow-lg"
                disabled={
                  isSubmitting ||
                  authLoading ||
                  !!errors.email ||
                  !!errors.password
                }
                aria-label="Sign in to your account"
              >
                {isSubmitting || authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Keyboard Shortcut Hint */}
              <p className="text-xs text-center text-muted-foreground">
                Press{" "}
                <kbd className="px-2 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
                  Enter
                </kbd>{" "}
                to sign in
              </p>
            </form>

            {/* Divider */}
            <div className="relative my-3 sm:my-4 md:my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <GoogleSignInButton
              fullWidth
              size="lg"
              text="Sign in with Google"
            />
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        open={show2FAModal}
        phoneNumber={twoFAPhoneNumber}
        errorMessage={twoFAError}
        isVerifying={isVerifying2FA}
        rememberDevice={rememberDevice}
        onRememberDeviceChange={setRememberDevice}
        onVerifySuccess={handle2FAVerifySuccess}
        onResend={handle2FAResend}
        onClose={handle2FAClose}
      />
    </div>
  );
}
