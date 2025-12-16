"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { humanizeError } from "@/lib/error-messages";

// Load environment variables (default to production backend)
const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

const isPhone = (val: string) => {
  // Philippine phone validation: 09XXXXXXXXX or +639XXXXXXXXX
  return /^(09|\+639)\d{9}$/.test(val);
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
    return {
      isValid: false,
      type: null,
      message: "Enter email or phone number",
    };
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
  password: z.string().min(1, "Password is required"),
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
        const serverMessage = json && (json.message || json.data?.message);
        const errorMessage = humanizeError(
          serverMessage || "Invalid credentials"
        );
        toast.error(errorMessage);
        return;
      }

      const accessToken = json?.data?.accessToken || json?.accessToken;
      const refreshToken = json?.data?.refreshToken || json?.refreshToken;
      const user = json?.data?.user || json?.user || null;

      if (!accessToken) {
        toast.error(
          "Login successful, but we couldn't complete the process. Please try again."
        );
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

      toast.success(`Welcome back, ${user?.firstName || data.identifier}!`);
      // Redirect to the original page or home
      router.push(redirectUrl || "/");
      router.refresh();
    } catch (error) {
      // Network error or endpoint not available
      const errorMessage = humanizeError(error);
      toast.error(errorMessage);
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
              <GoogleSignInButton
                fullWidth
                size="lg"
                text="Sign in with Google"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
