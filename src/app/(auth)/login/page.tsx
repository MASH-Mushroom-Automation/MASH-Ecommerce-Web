"use client";

/**
 * Login Page - Backend & Firebase Authentication
 *
 *
 * Supports two sign-in methods:
 * - Email/Password (via NestJS Backend)
 * - Google OAuth (via Firebase)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Shield,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthApi } from "@/lib/api/auth";
import { setAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { OTPVerificationModal } from "@/components/profile/OTPVerificationModal";
import { apiRequest } from "@/lib/api-client";

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
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
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
    user,
    isAuthenticated,
    signInWithEmailPassword,
    resendVerificationEmail,
    verify2FA,
    loading: authLoading,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);

  // Two-Factor Authentication state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAPhoneNumber, setTwoFAPhoneNumber] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFAAttempts, setTwoFAAttempts] = useState(0);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const tempTokenRef = useRef<string | null>(null);
  const MAX_2FA_ATTEMPTS = 3;

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      const storedRedirect = sessionStorage.getItem("auth-redirect-url");
      const destination = storedRedirect || redirectUrl || "/";

      // Clean up stored redirect
      if (storedRedirect) {
        sessionStorage.removeItem("auth-redirect-url");
      }

      // Use window.location for reliable redirect
      window.location.href = destination;
    }
  }, [isAuthenticated, user, redirectUrl]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange", // Validate on change for better UX
  });

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

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    // Reset error state
    setHasError(false);

    try {
      // Use backend API for email/password login
      const response = await AuthApi.login({
        email: data.email.trim(),
        password: data.password,
        rememberMe: data.rememberMe || false,
      });
      // Check if 2FA is required
      const requires2FA = response.requiresTwoFactor || response.data?.requiresTwoFactor;
      if (requires2FA) {
        const twoFATempToken = response.tempToken || response.data?.tempToken;
        const phoneNum = response.phoneNumber || response.data?.phoneNumber || "";
        // Store tempToken in memory only (never persisted)
        tempTokenRef.current = twoFATempToken || null;
        setTwoFAPhoneNumber(phoneNum);
        setTwoFAError("");
        setTwoFAAttempts(0);
        setShow2FAModal(true);

        // Auto-send OTP to phone
        try {
          await apiRequest("/auth/2fa/send", {
            method: "POST",
            headers: twoFATempToken ? { Authorization: `Bearer ${twoFATempToken}` } : undefined,
          });
          toast.info("Verification code sent", {
            description: `A code has been sent to ${phoneNum || "your phone"}.`,
          });
        } catch (sendError) {
          console.warn("[Login] [2FA] Failed to auto-send OTP:", sendError);
          // Don't block the modal - user can resend manually
        }

        return;
      }

      // Handle both response formats (nested data or direct)
      const user = response.data?.user || response.user;
      const accessToken = response.data?.accessToken || response.accessToken;
      const refreshToken = response.data?.refreshToken || response.refreshToken;

      if (!user) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // Check if email is verified
      if (!user.emailVerified) {
        console.warn("[Login] Email not verified");
        setHasError(true); // Mark as error to prevent navigation
        sessionStorage.setItem("pendingVerificationEmail", data.email);

        toast.warning("Email Verification Required", {
          description: "Please verify your email address to continue.",
          duration: 5000,
          action: {
            label: "Verify Now",
            onClick: () => router.push("/verify-otp"),
          },
        });
        return;
      }

      // Store tokens if available
      if (accessToken) {
        // Also store refresh token if available
        if (refreshToken) {
          setAuthToken(accessToken, refreshToken, data.rememberMe); // Use proper cookie storage
        } else {
          setAuthToken(accessToken, undefined, data.rememberMe); // Use proper cookie storage without refresh token
          // Refresh token not stored in localStorage; managed via HTTP-only cookies
        }
      }

      // Success notification
      const displayName = user.firstName || user.email.split("@")[0];
      toast.success("Login Successful!", {
        description: `Welcome back, ${displayName}!`,
        duration: 3000,
      });
      // Small delay for toast to show before navigation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Only navigate if no errors occurred
      if (!hasError) {
        // Redirect to stored URL or home (NO page refresh)
        const redirectUrl = sessionStorage.getItem("auth-redirect-url");
        if (redirectUrl) {
          sessionStorage.removeItem("auth-redirect-url");
          router.push(redirectUrl);
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      // Set error flag to prevent navigation
      setHasError(true);
      console.error("[Login] Error:", error);
      console.error("[Login] Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        fullError: error?.response?.data,
      });

      // Extract error message from all possible paths (backend sends: data.error.message)
      let errorMessage = "Unable to sign in. Please try again.";
      let errorTitle = "Login Failed";

      // Try nested error.message path first (correct backend structure)
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.details?.message) {
        errorMessage = error.response.data.details.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message && typeof error.message === "string") {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Ensure errorMessage is a string before calling string methods
      if (typeof errorMessage !== "string") {
        console.warn("[Login] errorMessage is not a string:", errorMessage);
        errorMessage = JSON.stringify(errorMessage);
      }
      // Handle specific error cases (now safe to call .toLowerCase())
      const lowerMsg = errorMessage.toLowerCase();
      const statusCode = error?.response?.status || error?.response?.statusCode;

      // Handle validation errors (400 Bad Request)
      if (statusCode === 400 || lowerMsg.includes("validation")) {
        toast.error("Invalid Request", {
          description: "Please check your login information and try again.",
          duration: 5000,
        });
        return;
      }

      if (
        lowerMsg.includes("not verified") ||
        lowerMsg.includes("email verification")
      ) {
        sessionStorage.setItem("pendingVerificationEmail", data.email);
        toast.error("Email Not Verified", {
          description: "Please verify your email address to continue.",
          duration: 6000,
          action: {
            label: "Verify Email",
            onClick: () => router.push("/verify-otp"),
          },
        });
        return; // CRITICAL: Stop execution, don't navigate
      } else if (
        lowerMsg.includes("invalid") ||
        lowerMsg.includes("incorrect") ||
        lowerMsg.includes("wrong") ||
        lowerMsg.includes("credentials")
      ) {
        toast.error("Invalid Credentials", {
          description:
            "The email or password you entered is incorrect. Please try again.",
          duration: 5000,
        });
        return; // CRITICAL: Stop execution, don't navigate
      } else if (
        lowerMsg.includes("not found") ||
        lowerMsg.includes("no user") ||
        lowerMsg.includes("doesn't exist")
      ) {
        toast.error("Account Not Found", {
          description:
            "No account exists with this email. Would you like to sign up?",
          duration: 6000,
          action: {
            label: "Sign Up",
            onClick: () => router.push("/signup"),
          },
        });
        return; // CRITICAL: Stop execution, don't navigate
      } else if (lowerMsg.includes("network") || lowerMsg.includes("timeout")) {
        toast.error("Connection Error", {
          description:
            "Unable to reach the server. Please check your internet connection.",
          duration: 5000,
        });
        return; // CRITICAL: Stop execution, don't navigate
      } else if (
        lowerMsg.includes("too many") ||
        lowerMsg.includes("rate limit")
      ) {
        toast.error("Too Many Attempts", {
          description: "Please wait a few minutes before trying again.",
          duration: 5000,
        });
        return; // CRITICAL: Stop execution, don't navigate
      } else {
        // Generic error with actual message
        toast.error(errorTitle, {
          description: errorMessage,
          duration: 5000,
        });
        return; // CRITICAL: Stop execution, don't navigate
      }
    } finally {
      // Always log completion
    }
  };

  const contextualMessage = getContextualMessage();

  /**
   * Handle 2FA OTP verification success
   * Called when user enters correct OTP code
   */
  const handle2FAVerifySuccess = useCallback(async (code: string) => {
    if (twoFAAttempts >= MAX_2FA_ATTEMPTS) {
      setTwoFAError("Maximum verification attempts exceeded. Please try logging in again.");
      return;
    }

    setIsVerifying2FA(true);
    setTwoFAError("");
    const currentAttempt = twoFAAttempts + 1;
    setTwoFAAttempts(currentAttempt);
    try {
      // Use AuthContext verify2FA which handles token storage + redirect
      await verify2FA(code);
      // Store remember device preference if checked
      if (rememberDevice) {
        // Trusted device cookie will be set by backend in a separate story
        // For now, store preference in sessionStorage
        sessionStorage.setItem("2fa-remember-device", "true");
      }

      setShow2FAModal(false);
      tempTokenRef.current = null;
      // verify2FA in AuthContext handles the redirect
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid verification code. Please try again.";
      console.error("[Login] [2FA] FAILED - Attempt:", currentAttempt, "Error:", message);

      if (currentAttempt >= MAX_2FA_ATTEMPTS) {
        setTwoFAError("Maximum verification attempts exceeded. Please try logging in again.");
      } else {
        const remaining = MAX_2FA_ATTEMPTS - currentAttempt;
        setTwoFAError(`${message} (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`);
      }
    } finally {
      setIsVerifying2FA(false);
    }
  }, [twoFAAttempts, verify2FA, rememberDevice]);

  /**
   * Handle 2FA OTP resend
   */
  const handle2FAResend = useCallback(async () => {
    try {
      await apiRequest("/auth/2fa/send", {
        method: "POST",
        headers: tempTokenRef.current ? { Authorization: `Bearer ${tempTokenRef.current}` } : undefined,
      });
      setTwoFAError("");
      toast.info("New code sent", {
        description: `A new verification code has been sent to ${twoFAPhoneNumber || "your phone"}.`,
      });
    } catch (error) {
      console.error("[Login] [2FA] Failed to resend OTP:", error);
      toast.error("Failed to resend code", {
        description: "Please try again in a moment.",
      });
    }
  }, [twoFAPhoneNumber]);

  /**
   * Handle 2FA modal close
   */
  const handle2FAClose = useCallback(() => {
    setShow2FAModal(false);
    setTwoFAError("");
    setTwoFAAttempts(0);
    tempTokenRef.current = null;
  }, []);

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
                    // Clear errors when user starts typing
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
                    onInput={(e) => {
                      const value = e.currentTarget.value;
                      setPassword(value);
                      // Clear errors when user starts typing
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

      {/* Two-Factor Authentication OTP Modal */}
      <OTPVerificationModal
        open={show2FAModal}
        onClose={handle2FAClose}
        phoneNumber={twoFAPhoneNumber}
        onVerifySuccess={handle2FAVerifySuccess}
        onResendOTP={handle2FAResend}
        errorMessage={twoFAError}
        isVerifying={isVerifying2FA}
      />

      {/* 2FA Additional Options (rendered inside modal via portal) */}
      {show2FAModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center pb-32 pointer-events-none"
          aria-hidden="true"
        >
          <div className="pointer-events-auto bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm w-full mx-4 space-y-3">
            {/* Remember Device */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(!!checked)}
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

            {/* Recovery Link */}
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
    </div>
  );
}
