"use client";

/**
 * Login Page - Firebase Authentication
 * 
 * Supports multiple sign-in methods:
 * - Email/Password (Traditional)
 * - Email Link (Passwordless)
 * - Google OAuth
 */

import React, { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const getEmailStatus = (email: string) => {
  if (!email) {
    return {
      isValid: false,
      message: "Enter email address",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(email)) {
    return { isValid: true, message: "Valid email" };
  }

  return {
    isValid: false,
    message: "Please enter a valid email address",
  };
};

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const verifyParam = searchParams.get("verify");
  const verifiedParam = searchParams.get("verified");

  const {
    signInWithEmailPassword,
    sendEmailSignInLink,
    resendVerificationEmail,
    checkForEmailLink,
    completeEmailLinkSignIn,
    getStoredEmail,
    loading: authLoading,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailLinkMode, setIsEmailLinkMode] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [sendingEmailLink, setSendingEmailLink] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Check for email link on mount
  useEffect(() => {
    const handleEmailLink = async () => {
      if (checkForEmailLink()) {
        const storedEmail = getStoredEmail();
        if (storedEmail) {
          try {
            await completeEmailLinkSignIn(storedEmail, window.location.href);
          } catch (error) {
            console.error("Email link sign-in failed:", error);
            // Clear URL params
            window.history.replaceState({}, "", "/login");
          }
        } else {
          // Ask user for email
          const userEmail = window.prompt(
            "Please enter your email to complete sign-in:"
          );
          if (userEmail) {
            try {
              await completeEmailLinkSignIn(userEmail, window.location.href);
            } catch (error) {
              console.error("Email link sign-in failed:", error);
            }
          }
          window.history.replaceState({}, "", "/login");
        }
      }
    };

    handleEmailLink();
  }, [checkForEmailLink, getStoredEmail, completeEmailLinkSignIn]);

  // Store redirect URL
  useEffect(() => {
    if (redirectUrl && typeof window !== "undefined") {
      sessionStorage.setItem("auth-redirect-url", redirectUrl);
    }
  }, [redirectUrl]);

  // Get contextual message based on redirect URL
  const getContextualMessage = () => {
    if (verifyParam === "true") {
      return "Please verify your email before signing in. Check your inbox.";
    }
    if (verifiedParam === "true") {
      return "Email verified! You can now sign in.";
    }
    if (!redirectUrl) return null;

    if (redirectUrl.includes("/checkout")) {
      return "Please sign in to complete your checkout";
    }
    if (redirectUrl.includes("/profile")) {
      return "Please sign in to access your profile";
    }
    if (redirectUrl.includes("/wishlist")) {
      return "Please sign in to view your wishlist";
    }
    if (redirectUrl.includes("/seller")) {
      return "Please sign in to access the seller dashboard";
    }
    if (redirectUrl.includes("/onboarding")) {
      return "Please sign in to continue your onboarding";
    }
    return "Please sign in to continue";
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      await signInWithEmailPassword(data.email, data.password);
    } catch (error) {
      // Error is handled in AuthContext
      console.error("Login error:", error);
    }
  };

  const handleSendEmailLink = async () => {
    const emailValue = email.trim();
    if (!emailValue || !getEmailStatus(emailValue).isValid) {
      return;
    }

    try {
      setSendingEmailLink(true);
      await sendEmailSignInLink(emailValue);
      setEmailLinkSent(true);
    } catch (error) {
      console.error("Send email link error:", error);
    } finally {
      setSendingEmailLink(false);
    }
  };

  const contextualMessage = getContextualMessage();

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

            {/* Toggle between Password and Email Link */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button
                type="button"
                variant={!isEmailLinkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEmailLinkMode(false)}
                className="text-xs"
              >
                <Lock className="w-3 h-3 mr-1" />
                Password
              </Button>
              <Button
                type="button"
                variant={isEmailLinkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEmailLinkMode(true)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Email Link
              </Button>
            </div>

            {isEmailLinkMode ? (
              /* Email Link (Passwordless) Mode */
              <div className="space-y-4">
                {emailLinkSent ? (
                  <div className="text-center py-8">
                    <div className="bg-green-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Check your email
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      We sent a sign-in link to <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click the link in the email to sign in. No password
                      needed!
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setEmailLinkSent(false);
                        setEmail("");
                      }}
                    >
                      Use a different email
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="email-link"
                        className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email-link"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        placeholder="Enter your email"
                        icon={<Mail className="h-5 w-5" />}
                      />
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
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full font-semibold"
                      onClick={handleSendEmailLink}
                      disabled={
                        sendingEmailLink ||
                        !email ||
                        !getEmailStatus(email).isValid
                      }
                    >
                      {sendingEmailLink ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Sign-In Link
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      We&apos;ll send you a magic link to sign in without a
                      password
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Password Mode (Traditional) */
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4 md:space-y-5"
              >
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
                      setEmail(e.currentTarget.value);
                      setValue("email", e.currentTarget.value);
                    }}
                    className="w-full"
                    placeholder="Enter your email"
                    icon={<Mail className="h-5 w-5" />}
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

                  {/* Error Message */}
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
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      className="w-full pr-10"
                      placeholder="Enter your password"
                      icon={<Lock className="h-5 w-5" />}
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

                  {/* Password Requirements Indicator */}
                  {password && (
                    <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2">
                        Password Requirements:
                      </p>
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            getPasswordRequirements(password).minLength
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getPasswordRequirements(password).minLength ? (
                            <Check className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <XIcon className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span>At least 6 characters</span>
                        </div>

                        <div
                          className={`flex items-center gap-2 text-xs ${
                            getPasswordRequirements(password).hasUppercase
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getPasswordRequirements(password).hasUppercase ? (
                            <Check className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <XIcon className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span>Contains uppercase letter (A-Z)</span>
                        </div>

                        <div
                          className={`flex items-center gap-2 text-xs ${
                            getPasswordRequirements(password).hasNumber
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getPasswordRequirements(password).hasNumber ? (
                            <Check className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <XIcon className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span>Contains a number (0-9)</span>
                        </div>

                        <div
                          className={`flex items-center gap-2 text-xs ${
                            getPasswordRequirements(password).hasSpecialChar
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getPasswordRequirements(password).hasSpecialChar ? (
                            <Check className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <XIcon className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span>
                            Contains special character (!@#$%^&* etc.)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
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
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          }
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
                  className="w-full font-semibold"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            )}

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
    </div>
  );
}
