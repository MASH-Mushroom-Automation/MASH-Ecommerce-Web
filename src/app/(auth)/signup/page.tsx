"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { User } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
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

// API Response Type
interface RegisterResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
    };
    verification: {
      sent: boolean;
      method: string;
      expiresIn: string;
      email: string;
    };
    nextStep: string;
  };
}

export default function SignupPage() {
  const router = useRouter();
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
      // Call backend API
      const response = await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });

      // Store email for verification page
      sessionStorage.setItem("pendingVerificationEmail", data.email);
      
      // Show success message
      toast.success("Registration successful!", {
        description: response.data.message || "Check your email for a verification code.",
      });

      // Redirect to verification page
      router.push("/verify-otp");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed", {
        description: err instanceof Error ? err.message : "Unable to create account. Please try again.",
      });
    }
  };

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
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="w-full"
                placeholder="Create a password"
              />
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
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="w-full"
                placeholder="Confirm your password"
              />
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
