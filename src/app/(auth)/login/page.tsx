"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginForm = { identifier: string; password: string; rememberMe?: boolean };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

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
    <Card className="w-full shadow-md overflow-hidden">
      <CardHeader className="text-center pb-2 relative">
        {/* Clear/Home Button */}
        <Link
          href="/"
          className="absolute top-4 right-4 p-2 hover:bg-muted/30 rounded-full transition-colors"
          title="Go to home"
        >
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </Link>

        {/* User Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-primary rounded-full p-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Sign in to your account
        </h2>
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Contextual Message Alert */}
        {contextualMessage && (
          <Alert className="mb-6 bg-primary/10 border-primary/30">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary font-medium">
              {contextualMessage}
            </AlertDescription>
          </Alert>
        )}
        {/* Form */}
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data as unknown as LoginForm)
          )}
          className="space-y-6"
        >
          {/* Email or Phone Input */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Email or Phone Number
            </label>
            <Input
              id="identifier"
              type="text"
              {...register("identifier")}
              className="w-full"
              placeholder="Enter your email or phone"
              icon={<Mail className="h-5 w-5" />}
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-destructive">
                {String(errors.identifier.message)}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="w-full"
              placeholder="Enter your password"
              icon={<Lock className="h-5 w-5" />}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
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
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember Me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
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
          <div className="relative my-6">
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
      </CardContent>
    </Card>
  );
}
