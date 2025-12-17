"use client";

/**
 * Signup Page - Firebase Authentication
 * 
 * Creates new user accounts with Firebase Auth.
 * Sends email verification automatically.
 */

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { User, Eye, EyeOff, Check, X as XIcon, Mail, Loader2 } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
  const { signUpWithEmail } = useAuth();
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
      // Create user with Firebase Auth
      const displayName = `${data.firstName} ${data.lastName}`;
      await signUpWithEmail(data.email, data.password, displayName);

      // Show success state
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      
      toast.success("Account created!", {
        description: "Please check your email to verify your account.",
      });
    } catch (err: unknown) {
      console.error("Registration error:", err);
      
      // Handle specific Firebase errors
      const errorCode = (err as { code?: string })?.code;
      let errorMessage = "Unable to create account. Please try again.";
      
      if (errorCode === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (errorCode === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }
      
      toast.error("Registration failed", { description: errorMessage });
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
              We&apos;ve sent a verification email to:
              <br />
              <strong className="text-foreground">{registeredEmail}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to verify your account, then you can sign in.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push("/login?verify=true")}
              >
                Go to Sign In
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
