"use client";

/**
 * Signup Page - Backend Email/Password Registration
 * 
 * Creates new user accounts via the NestJS backend.
 * Sends 6-digit verification code to email.
 * Redirects to verification page after successful registration.
 */

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { User, Eye, EyeOff, Check, X as XIcon, Mail } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/lib/api/auth";
import { generateUsername, generateUniqueUsername } from "@/lib/utils/username";
import { getDiceBearAvatar } from "@/lib/avatar";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    terms: z.boolean().refine((v) => v === true, {
      message: "You must agree to Terms & Conditions",
    }),
    privacy: z.boolean().refine((v) => v === true, {
      message: "You must accept the Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignupForm = z.infer<typeof signupSchema>;

// Password requirements checker
const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      privacy: false,
    },
  });

  const onSubmit: SubmitHandler<SignupForm> = async (data) => {
    try {
      // Generate unique username from email/name
      const baseUsername = generateUsername(data.email, data.firstName, data.lastName);
      const uniqueUsername = await generateUniqueUsername(baseUsername);
      
      // Generate DiceBear avatar URL
      const avatarUrl = getDiceBearAvatar(uniqueUsername);
      
      // Register user with backend API
      const response = await AuthApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        username: uniqueUsername,
        imageUrl: avatarUrl,
      });

      // Check if registration was successful
      if (response.success || response.data?.success) {
        // Store email for verification page (both keys for compatibility)
        sessionStorage.setItem("verification-email", data.email);
        sessionStorage.setItem("pendingVerificationEmail", data.email);
        
        // Show success state
        setRegisteredEmail(data.email);
        setRegistrationSuccess(true);
        
        toast.success("Account created!", {
          description: "Check your email for the 6-digit verification code.",
        });
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      
      // Extract error details from various error formats
      let errorMessage = "Registration failed. Please try again.";
      let statusCode = 500;
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if error has statusCode property
        if ('statusCode' in err) {
          statusCode = (err as any).statusCode;
        }
        // Check if error has response property
        if ('response' in err) {
          const response = (err as any).response;
          errorMessage = response?.error?.message || response?.message || errorMessage;
        }
      } else if (typeof err === "object" && err !== null) {
        const errorObj = err as { message?: string; error?: string; statusCode?: number };
        errorMessage = errorObj.message || errorObj.error || errorMessage;
        statusCode = errorObj.statusCode || 500;
      }
      
      // Handle specific error types based on status code
      if (statusCode === 409 || 
          errorMessage.toLowerCase().includes("already exists") || 
          errorMessage.toLowerCase().includes("already registered") ||
          errorMessage.toLowerCase().includes("already in use")) {
        // Email already exists (409 Conflict)
        toast.error("Email already registered", {
          description: (
            <div className="space-y-2">
              <p>This email is already associated with an account.</p>
              <div className="flex flex-col gap-1 text-xs">
                <span>• Try <strong>signing in</strong> instead</span>
                <span>• Use a <strong>different email</strong></span>
                <span>• <strong>Reset your password</strong> if you forgot it</span>
              </div>
            </div>
          ),
          duration: 6000,
          action: {
            label: "Sign In",
            onClick: () => router.push("/login"),
          },
        });
      } else if (statusCode === 429) {
        // Rate limit exceeded
        toast.error("Too many attempts", {
          description: "Please wait a few minutes before trying again.",
          duration: 5000,
        });
      } else if (statusCode === 400) {
        // Validation error
        toast.error("Invalid information", {
          description: errorMessage,
          duration: 5000,
        });
      } else if (statusCode === 500) {
        // Server error
        toast.error("Server error", {
          description: "Something went wrong on our end. Please try again later.",
          duration: 5000,
        });
      } else {
        // Generic error
        toast.error("Registration failed", {
          description: errorMessage,
          duration: 5000,
        });
      }
    }
  };

  const passwordReqs = getPasswordRequirements(password);

  // Success state - show verification message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-lg shadow-md p-8 text-center">
            <div className="bg-green-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Verify your email
            </h2>
            <p className="text-muted-foreground mb-6">
              We&apos;ve sent a 6-digit verification code to:
              <br />
              <strong className="text-foreground">{registeredEmail}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Enter the code to verify your account and complete registration.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push("/verify-otp")}
              >
                Enter Verification Code
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setRegistrationSuccess(false);
                  setRegisteredEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Signup Card */}
        <div className="bg-card rounded-lg shadow-md p-8">
          {/* User Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-4">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Create your account
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name Input */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                {...register("firstName")}
                className="w-full"
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Input */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                {...register("lastName")}
                className="w-full"
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>

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

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground mb-2"
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
                  placeholder="Create a password (min 6 characters)"
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
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full pr-10"
                  placeholder="Confirm your password"
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

            {/* Terms & Conditions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      className="mt-1"
                    />
                  )}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                  .
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.terms.message}
                </p>
              )}

              <div className="flex items-start space-x-2">
                <Controller
                  name="privacy"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="privacy"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      className="mt-1"
                    />
                  )}
                />
                <label
                  htmlFor="privacy"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I agree to let you use, processing, and sharing of my personal
                  information in accordance to the{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Data Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              {errors.privacy && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.privacy.message}
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
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

            {/* Google Sign Up */}
            <GoogleSignInButton 
              fullWidth 
              size="lg"
              text="Sign up with Google"
              className="py-6"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
