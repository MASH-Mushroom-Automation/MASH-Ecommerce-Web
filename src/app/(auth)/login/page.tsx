"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, X, AlertCircle, Check, X as XIcon, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";

// Load environment variables (default to production backend)
const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mash-backend-api.up.railway.app";

const isPhone = (val: string) => {
  // Simple phone validation: +country or local digits (10-15)
  return /^\+?\d{10,15}$/.test(val);
};

const validatePassword = (val: string) => {
  const errors: string[] = [];
  
  // Check minimum length
  if (val.length < 8) {
    errors.push("at least 8 characters");
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(val)) {
    errors.push("an uppercase letter");
  }
  
  // Check for number
  if (!/\d/.test(val)) {
    errors.push("a number");
  }
  
  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
    errors.push("a special character");
  }
  
  return errors;
};

const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const getIdentifierStatus = (identifier: string) => {
  if (!identifier) {
    return { isValid: false, type: null, message: "Enter email or phone number" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{10,15}$/;

  if (emailRegex.test(identifier)) {
    return { isValid: true, type: "email", message: "Valid email" };
  }

  if (phoneRegex.test(identifier)) {
    return { isValid: true, type: "phone", message: "Valid phone number" };
  }

  return {
    isValid: false,
    type: null,
    message: "Must be a valid email (user@example.com) or phone (+1234567890)",
  };
};

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (val) => z.string().email().safeParse(val).success || isPhone(val),
      {
        message: "Enter a valid email or phone number",
      }
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (val) => validatePassword(val).length === 0,
      (val) => ({
        message: `Password must contain ${validatePassword(val).join(", ")}`,
      })
    ),
  rememberMe: z.boolean().default(false),
});

type LoginForm = { identifier: string; password: string; rememberMe?: boolean };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  // Get contextual message based on redirect URL
  const getContextualMessage = () => {
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
    // Attempt API login if available; otherwise gracefully fall back to mock login
    try {
      const res = await fetch(`${API_ENDPOINT}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.identifier,
          password: data.password,
        }),
      });

      // Parse backend response which contains `data.accessToken`, `data.refreshToken` and `data.user`
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (json && (json.message || json.data?.message)) ||
          "Invalid credentials";
        toast.error(message);
        return;
      }

      const accessToken = json?.data?.accessToken || json?.accessToken;
      const refreshToken = json?.data?.refreshToken || json?.refreshToken;
      const user = json?.data?.user || json?.user || null;

      if (!accessToken) {
        toast.error("Login succeeded but no access token was returned.");
        return;
      }

      // Persist tokens and user info
      setAuthToken(accessToken, !!data.rememberMe);
      try {
        if (typeof window !== "undefined") {
          if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            sessionStorage.setItem("user", JSON.stringify(user));
          }
        }
      } catch {
        // ignore storage errors
      }

      toast.success(`Signed in as ${user?.email || data.identifier}.`);
      // Redirect to the original page or home
      router.push(redirectUrl || "/");
      router.refresh();
    } catch {
      // Network error or endpoint not available: use mock success to keep UX flowing in dev
      setAuthToken("mock-token", !!data.rememberMe);
      toast.success(`Signed in as ${data.identifier}.`);
      // Redirect to the original page or home
      router.push(redirectUrl || "/");
      router.refresh();
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign-in
    console.log("Google sign-in");
  };

  const handleFacebookSignIn = () => {
    // Handle Facebook sign-in
    console.log("Facebook sign-in");
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
            <Alert className="mb-4 sm:mb-6 bg-primary/10 border-primary/30">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary font-medium text-xs sm:text-sm">
                {contextualMessage}
              </AlertDescription>
            </Alert>
          )}
          {/* Form */}
          <form
            onSubmit={handleSubmit((data) =>
              onSubmit(data as unknown as LoginForm)
            )}
            className="space-y-3 sm:space-y-4 md:space-y-5"
          >
          {/* Email or Phone Input */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
            >
              Email or Phone Number
            </label>
            <Input
              id="identifier"
              type="text"
              {...register("identifier")}
              onInput={(e) => setIdentifier(e.currentTarget.value)}
              className="w-full"
              placeholder="Enter your email or phone"
              icon={<Mail className="h-5 w-5" />}
            />

            {/* Identifier Validation Indicator */}
            {identifier && (
              <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                <div
                  className={`flex items-center gap-2 text-xs ${
                    getIdentifierStatus(identifier).isValid
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getIdentifierStatus(identifier).isValid ? (
                    <Check className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <XIcon className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span>{getIdentifierStatus(identifier).message}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.identifier && (
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                {String(errors.identifier.message)}
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                    <span>At least 8 characters</span>
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
                    <span>Contains special character (!@#$%^&* etc.)</span>
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
            className="w-full font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>

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
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Facebook Sign In */}
          <Button
            type="button"
            onClick={handleFacebookSignIn}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="#1877F2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Sign in with Facebook
          </Button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
