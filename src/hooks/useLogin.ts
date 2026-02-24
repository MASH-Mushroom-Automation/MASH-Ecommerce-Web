"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthApi } from "@/lib/api/auth";
import { setAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Schema & types
// ---------------------------------------------------------------------------

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

export type LoginForm = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Email validation helper
// ---------------------------------------------------------------------------

export const getEmailStatus = (email: string) => {
  if (!email) {
    return { isValid: false, message: "Enter email address" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email)) {
    return { isValid: true, message: "Valid email" };
  }
  return { isValid: false, message: "Please enter a valid email address" };
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const MAX_2FA_ATTEMPTS = 3;

export function useLogin() {
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

  // Form state shadows (for live UI indicators)
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

  // -----------------------------------------------------------------------
  // Effects
  // -----------------------------------------------------------------------

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      const storedRedirect = sessionStorage.getItem("auth-redirect-url");
      const destination = storedRedirect || redirectUrl || "/";
      if (storedRedirect) {
        sessionStorage.removeItem("auth-redirect-url");
      }
      window.location.href = destination;
    }
  }, [isAuthenticated, user, redirectUrl]);

  // Store redirect URL
  useEffect(() => {
    if (redirectUrl && typeof window !== "undefined") {
      sessionStorage.setItem("auth-redirect-url", redirectUrl);
    }
  }, [redirectUrl]);

  // -----------------------------------------------------------------------
  // React Hook Form
  // -----------------------------------------------------------------------

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onChange",
  });

  // -----------------------------------------------------------------------
  // Contextual message
  // -----------------------------------------------------------------------

  const getContextualMessage = useCallback((): string | null => {
    if (verifyParam === "true") {
      return "Please verify your email before signing in. Check your inbox.";
    }
    if (verifiedParam === "true") {
      return "Email verified! You can now sign in.";
    }
    if (!redirectUrl) return null;
    if (redirectUrl.includes("/checkout"))
      return "Please sign in to complete your checkout";
    if (redirectUrl.includes("/profile"))
      return "Please sign in to access your profile";
    if (redirectUrl.includes("/wishlist"))
      return "Please sign in to view your wishlist";
    if (redirectUrl.includes("/seller"))
      return "Please sign in to access the seller dashboard";
    if (redirectUrl.includes("/onboarding"))
      return "Please sign in to continue your onboarding";
    return "Please sign in to continue";
  }, [verifyParam, verifiedParam, redirectUrl]);

  const contextualMessage = getContextualMessage();

  // -----------------------------------------------------------------------
  // Login submit handler
  // -----------------------------------------------------------------------

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setHasError(false);

    try {
      const response = await AuthApi.login({
        email: data.email.trim(),
        password: data.password,
        rememberMe: data.rememberMe || false,
      });

      // Check if 2FA is required
      const requires2FA =
        response.requiresTwoFactor || response.data?.requiresTwoFactor;
      if (requires2FA) {
        const twoFATempToken =
          response.tempToken || response.data?.tempToken;
        const phoneNum =
          response.phoneNumber || response.data?.phoneNumber || "";
        tempTokenRef.current = twoFATempToken || null;
        setTwoFAPhoneNumber(phoneNum);
        setTwoFAError("");
        setTwoFAAttempts(0);
        setShow2FAModal(true);

        try {
          await apiRequest("/auth/2fa/send", {
            method: "POST",
            headers: twoFATempToken
              ? { Authorization: `Bearer ${twoFATempToken}` }
              : undefined,
          });
          toast.info("Verification code sent", {
            description: `A code has been sent to ${phoneNum || "your phone"}.`,
          });
        } catch (sendError) {
          console.warn("[Login] [2FA] Failed to auto-send OTP:", sendError);
        }
        return;
      }

      const resUser = response.data?.user || response.user;
      const accessToken =
        response.data?.accessToken || response.accessToken;
      const refreshToken =
        response.data?.refreshToken || response.refreshToken;

      if (!resUser) {
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!resUser.emailVerified) {
        console.warn("[Login] Email not verified");
        setHasError(true);
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

      if (accessToken) {
        if (refreshToken) {
          setAuthToken(accessToken, refreshToken, data.rememberMe);
        } else {
          setAuthToken(accessToken, undefined, data.rememberMe);
        }
      }

      const displayName =
        resUser.firstName || resUser.email.split("@")[0];
      toast.success("Login Successful!", {
        description: `Welcome back, ${displayName}!`,
        duration: 3000,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!hasError) {
        const stored = sessionStorage.getItem("auth-redirect-url");
        if (stored) {
          sessionStorage.removeItem("auth-redirect-url");
          router.push(stored);
        } else {
          router.push("/");
        }
      }
    } catch (error: unknown) {
      setHasError(true);
      console.error("[Login] Error:", error);

      let errorMessage = "Unable to sign in. Please try again.";
      let errorTitle = "Login Failed";
      const err = error as Record<string, unknown>;
      const resp = (err?.response as Record<string, unknown>) || {};
      const respData = (resp?.data as Record<string, unknown>) || {};

      if ((respData?.error as Record<string, unknown>)?.message) {
        errorMessage = String(
          (respData.error as Record<string, unknown>).message
        );
      } else if ((respData?.details as Record<string, unknown>)?.message) {
        errorMessage = String(
          (respData.details as Record<string, unknown>).message
        );
      } else if (respData?.message) {
        errorMessage = String(respData.message);
      } else if (err?.message && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      if (typeof errorMessage !== "string") {
        errorMessage = JSON.stringify(errorMessage);
      }

      const lowerMsg = errorMessage.toLowerCase();
      const statusCode =
        (resp?.status as number) || (resp?.statusCode as number);

      if (statusCode === 400 || lowerMsg.includes("validation")) {
        toast.error("Invalid Request", {
          description:
            "Please check your login information and try again.",
          duration: 5000,
        });
      } else if (
        lowerMsg.includes("not verified") ||
        lowerMsg.includes("email verification")
      ) {
        sessionStorage.setItem(
          "pendingVerificationEmail",
          (error as { email?: string })?.email || ""
        );
        toast.error("Email Not Verified", {
          description:
            "Please verify your email address to continue.",
          duration: 6000,
          action: {
            label: "Verify Email",
            onClick: () => router.push("/verify-otp"),
          },
        });
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
      } else if (
        lowerMsg.includes("network") ||
        lowerMsg.includes("timeout")
      ) {
        toast.error("Connection Error", {
          description:
            "Unable to reach the server. Please check your internet connection.",
          duration: 5000,
        });
      } else if (
        lowerMsg.includes("too many") ||
        lowerMsg.includes("rate limit")
      ) {
        toast.error("Too Many Attempts", {
          description: "Please wait a few minutes before trying again.",
          duration: 5000,
        });
      } else {
        toast.error(errorTitle, {
          description: errorMessage,
          duration: 5000,
        });
      }
    }
  };

  // -----------------------------------------------------------------------
  // 2FA handlers
  // -----------------------------------------------------------------------

  const handle2FAVerifySuccess = useCallback(
    async (code: string) => {
      if (twoFAAttempts >= MAX_2FA_ATTEMPTS) {
        setTwoFAError(
          "Maximum verification attempts exceeded. Please try logging in again."
        );
        return;
      }

      setIsVerifying2FA(true);
      setTwoFAError("");
      const currentAttempt = twoFAAttempts + 1;
      setTwoFAAttempts(currentAttempt);

      try {
        await verify2FA(code);
        if (rememberDevice) {
          sessionStorage.setItem("2fa-remember-device", "true");
        }
        setShow2FAModal(false);
        tempTokenRef.current = null;
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Invalid verification code. Please try again.";
        console.error(
          "[Login] [2FA] FAILED - Attempt:",
          currentAttempt,
          "Error:",
          message
        );
        if (currentAttempt >= MAX_2FA_ATTEMPTS) {
          setTwoFAError(
            "Maximum verification attempts exceeded. Please try logging in again."
          );
        } else {
          const remaining = MAX_2FA_ATTEMPTS - currentAttempt;
          setTwoFAError(
            `${message} (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`
          );
        }
      } finally {
        setIsVerifying2FA(false);
      }
    },
    [twoFAAttempts, verify2FA, rememberDevice]
  );

  const handle2FAResend = useCallback(async () => {
    try {
      await apiRequest("/auth/2fa/send", {
        method: "POST",
        headers: tempTokenRef.current
          ? { Authorization: `Bearer ${tempTokenRef.current}` }
          : undefined,
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

  const handle2FAClose = useCallback(() => {
    setShow2FAModal(false);
    setTwoFAError("");
    setTwoFAAttempts(0);
    tempTokenRef.current = null;
  }, []);

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  return {
    // form
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting,
    setValue,
    clearErrors,
    onSubmit,

    // state
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    authLoading,

    // contextual
    contextualMessage,
    verifyParam,
    verifiedParam,
    resendVerificationEmail,

    // 2FA
    show2FAModal,
    twoFAPhoneNumber,
    twoFAError,
    isVerifying2FA,
    rememberDevice,
    setRememberDevice,
    handle2FAVerifySuccess,
    handle2FAResend,
    handle2FAClose,
  };
}
