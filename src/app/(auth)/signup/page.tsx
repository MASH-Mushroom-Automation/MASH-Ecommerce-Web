"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Check, X as XIcon, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Validation helper for names (letters, spaces, hyphens only, no special chars)
const validateName = (name: string) => {
  const errors: string[] = [];
  if (name.length < 2) errors.push("at least 2 characters");
  if (name.length > 24) errors.push("maximum 24 characters");
  if (!/^[a-zA-Z\s\-']+$/.test(name)) errors.push("only letters, spaces, hyphens and apostrophes allowed");
  return errors;
};

// Validation helper for password
const validatePassword = (val: string) => {
  const errors: string[] = [];
  
  if (val.length < 8) {
    errors.push("at least 8 characters");
  }
  
  if (!/[A-Z]/.test(val)) {
    errors.push("an uppercase letter");
  }
  
  if (!/\d/.test(val)) {
    errors.push("a number");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
    errors.push("a special character");
  }
  
  return errors;
};

// Get password requirements status
const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

// Get name validation status
const getNameStatus = (name: string) => {
  const errors = validateName(name);
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? `Must contain ${errors.join(", ")}` : "Valid name",
  };
};

// Get email validation status
const getEmailStatus = (email: string) => {
  if (!email) {
    return { isValid: false, message: "Enter an email address" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(email)) {
    return { isValid: true, message: "Valid email" };
  }
  
  return {
    isValid: false,
    message: "Enter a valid email (user@example.com)",
  };
};

const signupSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(24, "Username must be less than 24 characters")
      .refine(
        (val) => /^[a-zA-Z\s\-']+$/.test(val),
        "Username can only contain letters, spaces, hyphens and apostrophes"
      ),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(24, "First name must be less than 24 characters")
      .refine(
        (val) => /^[a-zA-Z\s\-']+$/.test(val),
        "First name can only contain letters, spaces, hyphens and apostrophes"
      ),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(24, "Last name must be less than 24 characters")
      .refine(
        (val) => /^[a-zA-Z\s\-']+$/.test(val),
        "Last name can only contain letters, spaces, hyphens and apostrophes"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        (val) => validatePassword(val).length === 0,
        (val) => ({
          message: `Password must contain ${validatePassword(val).join(", ")}`,
        })
      ),
    confirmPassword: z
      .string()
      .min(8, "Confirm your password"),
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

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
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
      // Store user data and email for verification
      setUserEmail(data.email);
      
      // TODO: Send verification code to user's email
      // await AuthApi.sendVerificationCode(data.email)
      toast.success("Verification code sent to your email!");
      
      // Transition to verification step
      setVerificationStep(true);
      setResendTimer(60); // 60 second timer for resend
      
      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to send verification code"
      );
    }
  };

  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: Verify code with backend
      // const verified = await AuthApi.verifyCode(userEmail, verificationCode)
      
      // Simulating verification success
      toast.success("Email verified successfully! Account created.");
      
      // Redirect to login
      router.push("/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Verification code is incorrect"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    try {
      // TODO: Resend verification code
      // await AuthApi.sendVerificationCode(userEmail)
      toast.success("Verification code resent to your email!");
      setResendTimer(60);
      
      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend code"
      );
    }
  };

  const handleBackToSignup = () => {
    setVerificationStep(false);
    setVerificationCode("");
  };

  const handleGoogleSignUp = () => {
    // Handle Google sign-up
    console.log("Google sign-up");
  };

  const handleFacebookSignUp = () => {
    // Handle Facebook sign-up
    console.log("Facebook sign-up");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 sm:py-8 md:py-12">
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Signup Card */}
        <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 md:p-12">
          {verificationStep ? (
            // Verification Section
            <>
              {/* Back Button */}
              <button
                onClick={handleBackToSignup}
                className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign Up
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="bg-primary rounded-full p-3 sm:p-4">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-1 sm:mb-2">
                Verify Your Email
              </h2>
              <p className="text-center text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8">
                We&apos;ve sent a 6-digit code to <br />
                <span className="font-semibold text-foreground">{userEmail}</span>
              </p>

              {/* Verification Code Input */}
              <div className="mb-6">
                <label
                  htmlFor="verificationCode"
                  className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2"
                >
                  Verification Code
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.currentTarget.value.replace(/\D/g, "");
                    setVerificationCode(value);
                  }}
                  className="w-full text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerificationSubmit}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 sm:py-5 md:py-6 rounded-lg font-semibold text-sm sm:text-base mb-4"
              >
                {isVerifying ? "Verifying..." : "Verify Email"}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Resend code in{" "}
                    <span className="font-semibold text-foreground">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Didn&apos;t receive the code? Resend
                  </button>
                )}
              </div>
            </>
          ) : (
            // Signup Form Section
            <>
              {/* User Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="bg-primary rounded-full p-3 sm:p-4">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-1 sm:mb-2">
                Create your account
              </h2>
              <p className="text-center text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                maxLength={24}
                {...register("username")}
                onInput={(e) => setUsername(e.currentTarget.value)}
                className="w-full"
                placeholder="Choose your username"
              />

              {/* Username Validation Indicator */}
              {username && (
                <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      getNameStatus(username).isValid
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getNameStatus(username).isValid ? (
                      <Check className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <XIcon className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span>{getNameStatus(username).message}</span>
                  </div>
                </div>
              )}

              {errors.username && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* First & Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* First Name Input */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
                >
                  First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  maxLength={24}
                  {...register("firstName")}
                  onInput={(e) => setFirstName(e.currentTarget.value)}
                  className="w-full"
                  placeholder="Enter your first name"
                />

                {/* First Name Validation Indicator */}
                {firstName && (
                  <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        getNameStatus(firstName).isValid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {getNameStatus(firstName).isValid ? (
                        <Check className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <XIcon className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span>{getNameStatus(firstName).message}</span>
                    </div>
                  </div>
                )}

                {errors.firstName && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name Input */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  maxLength={24}
                  {...register("lastName")}
                  onInput={(e) => setLastName(e.currentTarget.value)}
                  className="w-full"
                  placeholder="Enter your last name"
                />

                {/* Last Name Validation Indicator */}
                {lastName && (
                  <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        getNameStatus(lastName).isValid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {getNameStatus(lastName).isValid ? (
                        <Check className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <XIcon className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span>{getNameStatus(lastName).message}</span>
                    </div>
                  </div>
                )}

                {errors.lastName && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                onInput={(e) => setEmail(e.currentTarget.value)}
                className="w-full"
                placeholder="Enter your email"
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
                  {errors.email.message}
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
                  placeholder="Create a password"
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

              {errors.password && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                  className="w-full pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && password && (
                <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-muted/50 rounded-md border border-border">
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {password === confirmPassword ? (
                      <Check className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <XIcon className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span>
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </span>
                  </div>
                </div>
              )}

              {errors.confirmPassword && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start space-x-2">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      className="mt-0.5 sm:mt-1"
                    />
                  )}
                />
                <label
                  htmlFor="terms"
                  className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
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
                <p className="mt-1 text-xs sm:text-sm text-destructive">
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
                      className="mt-0.5 sm:mt-1"
                    />
                  )}
                />
                <label
                  htmlFor="privacy"
                  className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
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
                <p className="mt-1 text-xs sm:text-sm text-destructive">
                  {errors.privacy.message}
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 sm:py-5 md:py-6 rounded-lg font-semibold text-sm sm:text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Divider */}
            <div className="relative my-4 sm:my-5 md:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              variant="outline"
              className="w-full py-4 sm:py-5 md:py-6 border-border hover:bg-muted/30 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
              Sign up with Google
            </Button>

            {/* Facebook Sign Up */}
            <Button
              type="button"
              onClick={handleFacebookSignUp}
              variant="outline"
              className="w-full py-4 sm:py-5 md:py-6 border-border hover:bg-muted/30 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="#1877F2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Sign up with Facebook
            </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
