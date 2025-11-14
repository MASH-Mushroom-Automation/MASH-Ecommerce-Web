# MASH Backend API - Complete Authentication Implementation Guide

## 📋 Table of Contents
1. [Backend API Connection Setup](#backend-api-connection-setup)
2. [Authentication Flow Overview](#authentication-flow-overview)
3. [Registration Implementation](#registration-implementation)
4. [Email Verification Implementation](#email-verification-implementation)
5. [Login Implementation](#login-implementation)
6. [Forgot Password Implementation](#forgot-password-implementation)
7. [Token Management](#token-management)
8. [Frontend Integration](#frontend-integration)
9. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Backend API Connection Setup

### API Base Configuration

**Production API URL**: `https://mash-backend-api-production.up.railway.app`

**API Endpoints Base**: `https://mash-backend-api-production.up.railway.app/api/v1`

### Environment Setup

Create or update `.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://mash-backend-api-production.up.railway.app/api/v1
NEXT_PUBLIC_API_BASE_URL=https://mash-backend-api-production.up.railway.app

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_API_LOGGING=true

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth-token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken
```

### Update API Client

Update `src/lib/api-client.ts`:

```typescript
// API Client Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mash-backend-api-production.up.railway.app/api/v1";

// Helper to get auth token from cookies
function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Helper to get refresh token from localStorage
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

// Generic API request function with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Handle unauthorized errors (token expired)
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Update tokens
          if (typeof document !== "undefined") {
            document.cookie = `auth-token=${encodeURIComponent(refreshData.data.accessToken)}; Path=/`;
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("refreshToken", refreshData.data.refreshToken);
          }
          
          // Retry original request
          return apiRequest<T>(endpoint, options);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    // If refresh fails or no refresh token, logout
    if (typeof window !== "undefined") {
      // Clear tokens
      document.cookie = "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}
```

---

## Authentication Flow Overview

### Complete Authentication Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    MASH Authentication Flow                      │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION (/signup)
   ↓
   User fills form → POST /api/v1/auth/register
   ↓
   Response: {
     "success": true,
     "message": "Registration successful! A 6-digit verification code has been sent to your email.",
     "user": {...},
     "verification": {
       "sent": true,
       "method": "code",
       "expiresIn": "10 minutes"
     }
   }
   ↓
   Redirect to /verify-otp

2. EMAIL VERIFICATION (/verify-otp)
   ↓
   User receives email with 6-digit code (e.g., "132248")
   ↓
   User enters code → POST /api/v1/auth/verify-email-code
   ↓
   Response: {
     "success": true,
     "message": "Email verified successfully! You are now logged in.",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {...}
   }
   ↓
   Store token → Redirect to /onboarding or /shop

3. LOGIN (/login)
   ↓
   User enters email + password → POST /api/v1/auth/login
   ↓
   Response: {
     "success": true,
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {...}
   }
   ↓
   Store tokens → Redirect to /shop

4. FORGOT PASSWORD (/forgot-password)
   ↓
   User enters email → POST /api/v1/auth/forgot-password
   ↓
   Response: {
     "success": true,
     "message": "Password reset email sent"
   }
   ↓
   User receives email with reset code
   ↓
   Redirect to /reset-password
```

---

## Registration Implementation

### Step 1: Update Signup Page

Update `src/app/(auth)/signup/page.tsx`:

```typescript
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
        description: response.data.message,
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

  // ... rest of the component (form JSX)
}
```

### Step 2: Backend Registration Endpoint

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "mash.mushroom.automation@gmail.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "success": true,
    "message": "Registration successful! A 6-digit verification code has been sent to your email.",
    "user": {
      "id": "cmhutwm6p0003vpcowxq9cmrs",
      "clerkId": "local_954676c72bc42eaa17ecd0cbc7d69d6f",
      "email": "mash.mushroom.automation@gmail.com",
      "username": null,
      "firstName": "John",
      "lastName": "Doe",
      "imageUrl": "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=mash.mushroom.automation",
      "emailVerified": false,
      "role": "USER",
      "createdAt": "2025-11-11T17:12:05.713Z"
    },
    "verification": {
      "sent": true,
      "method": "code",
      "expiresIn": "10 minutes",
      "email": "mash.mushroom.automation@gmail.com"
    },
    "nextStep": "Check your email (mash.mushroom.automation@gmail.com) for a 6-digit verification code. Enter it in the app using POST /auth/verify-email-code."
  }
}
```

**Error Responses**:
- **400**: Email already exists
- **429**: Too many requests (rate limited)
- **500**: Email service unavailable

---

## Email Verification Implementation

### Step 1: Update Verify OTP Page

Update `src/app/(auth)/verify-otp/page.tsx`:

```typescript
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// API Response Type
interface VerifyCodeResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
      role: string;
    };
  };
}

interface ResendCodeResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
    expiresIn: string;
    email: string;
  };
}

export default function VerifyOTPPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Get email from session storage
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      toast.error("No pending verification", {
        description: "Please register first",
      });
      router.push("/signup");
    }
  }, [router]);

  const handleVerify = async () => {
    if (code.length !== 6 || /\D/.test(code)) {
      toast.error("Invalid code", {
        description: "Please enter the 6-digit code from your email.",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Call verification endpoint
      const response = await apiRequest<VerifyCodeResponse>("/auth/verify-email-code", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          code: code,
        }),
      });

      // Store auth token
      setAuthToken(response.data.token, true);

      // Clear pending email
      sessionStorage.removeItem("pendingVerificationEmail");

      // Show success message
      toast.success("Email verified!", {
        description: response.data.message,
      });

      // Redirect to onboarding or shop
      router.push("/onboarding");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed", {
        description: error instanceof Error ? error.message : "Please check your code and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await apiRequest<ResendCodeResponse>("/auth/resend-verification-code", {
        method: "POST",
        body: JSON.stringify({
          email: email,
        }),
      });

      toast.success("Code resent!", {
        description: response.data.message,
      });
      setCode("");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Unable to resend code", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("pendingVerificationEmail");
    router.push("/signup");
  };

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{3})(.*)(@.*)/, "$1*****$3")
    : "your email";

  return (
    <>
      <div className="bg-card rounded-lg shadow-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary rounded-full p-4">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Enter verification code
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Enter the 6-digit code sent to <br />
          <span className="font-medium">{maskedEmail}</span>
        </p>

        {/* OTP Input - Updated to 6 digits */}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
            disabled={isVerifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Resend Code */}
        <p className="text-center text-sm text-muted-foreground mb-8">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-primary hover:underline font-medium disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleVerify}
            disabled={isVerifying || code.length !== 6}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isVerifying}
            className="w-full py-6 border-primary text-primary hover:bg-primary/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
```

### Step 2: Backend Verification Endpoint

**Endpoint**: `POST /api/v1/auth/verify-email-code`

**Request Body**:
```json
{
  "email": "mash.mushroom.automation@gmail.com",
  "code": "132248"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "Email verified successfully! You are now logged in.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmhutqpa70001vpco2ypetagm",
      "email": "mash.mushroom.automation@gmail.com",
      "username": null,
      "firstName": "John",
      "lastName": "Doe",
      "imageUrl": "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=mash.mushroom.automation",
      "role": "USER",
      "emailVerified": true
    }
  }
}
```

### Step 3: Resend Verification Code

**Endpoint**: `POST /api/v1/auth/resend-verification-code`

**Request Body**:
```json
{
  "email": "mash.mushroom.automation@gmail.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "A new 6-digit verification code has been sent to your email.",
    "expiresIn": "10 minutes",
    "email": "mash.mushroom.automation@gmail.com"
  }
}
```

---

## Login Implementation

### Step 1: Update Login Page

Update `src/app/(auth)/login/page.tsx`:

```typescript
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// API Response Type
interface LoginResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      emailVerified: boolean;
    };
  };
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/shop";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      // Call backend API
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      // Handle both response formats (nested data or direct)
      const accessToken = response.data?.accessToken || response.accessToken;
      const refreshToken = response.data?.refreshToken || response.refreshToken;
      const user = response.data?.user || response.user;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Store auth token
      setAuthToken(accessToken, data.rememberMe || false);

      // Store refresh token
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Store user data
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Show success message
      toast.success("Login successful!", {
        description: `Welcome back, ${user?.firstName || "User"}!`,
      });

      // Redirect
      router.push(redirect);
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific error messages
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password";
      
      if (errorMessage.includes("not verified") || errorMessage.includes("verification")) {
        toast.error("Email not verified", {
          description: "Please check your email and verify your account first.",
          action: {
            label: "Resend Code",
            onClick: () => router.push("/verify-otp"),
          },
        });
      } else {
        toast.error("Login failed", {
          description: errorMessage,
        });
      }
    }
  };

  // ... rest of the component (form JSX)
}
```

### Step 2: Backend Login Endpoint

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "mash.mushroom.automation@gmail.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTJ4M3k0ejVhNmI3YzhkOWUwZjEiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MzE0MDMyMDAsImV4cCI6MTczMTQwNjgwMH0.xyz123abc",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTJ4M3k0ejVhNmI3YzhkOWUwZjEiLCJzZXNzaW9uSWQiOiJzZXNzXzEyMzQ1Njc4IiwiaWF0IjoxNzMxNDAzMjAwLCJleHAiOjE3MzIwMDgwMDB9.abc789xyz",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": "cm2x3y4z5a6b7c8d9e0f1",
    "clerkId": "user_2abc123xyz",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "imageUrl": "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=johndoe",
    "role": "USER",
    "emailVerified": true,
    "isActive": true,
    "lastLoginAt": "2025-11-10T09:00:00.000Z"
  }
}
```

**Error Responses**:
- **401**: Invalid credentials or email not verified
- **429**: Too many login attempts

---

## Forgot Password Implementation

### Step 1: Update Forgot Password Page

Update `src/app/(auth)/forgot-password/page.tsx`:

```typescript
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

// API Response Type
interface ForgotPasswordResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
  };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async (data) => {
    try {
      // Call backend API
      const response = await apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
        }),
      });

      // Store email for reset page
      sessionStorage.setItem("resetPasswordEmail", data.email);

      // Show success message
      toast.success("Password reset email sent!", {
        description: "Check your email for instructions to reset your password.",
      });

      // Redirect to reset password page
      router.push("/reset-password");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Request failed", {
        description: err instanceof Error ? err.message : "Unable to process request. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary rounded-full p-4">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Forgot your password?
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Enter your email address and we&apos;ll send you a reset code.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="w-full"
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
          >
            {isSubmitting ? "Sending..." : "Send Reset Code"}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
```

### Step 2: Backend Forgot Password Endpoint

**Endpoint**: `POST /api/v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "mash.mushroom.automation@gmail.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "Password reset email sent"
  }
}
```

**Note**: The API returns the same response regardless of whether the email exists (security best practice to prevent email enumeration).

---

## Token Management

### Access Token vs Refresh Token

**Access Token**:
- **Lifetime**: 1 hour (3600 seconds)
- **Storage**: `auth-token` cookie
- **Usage**: Include in `Authorization: Bearer <token>` header for all API requests
- **Expiry**: Cannot be refreshed after expiry

**Refresh Token**:
- **Lifetime**: 7 days (604800 seconds)
- **Storage**: `localStorage` with key `refreshToken`
- **Usage**: Use to get new access token when expired
- **Security**: One-time use (new refresh token issued on refresh)

### Token Refresh Implementation

Update `src/lib/api-client.ts` to handle token refresh:

```typescript
// In apiRequest function, handle 401 errors
if (response.status === 401) {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        
        // Update tokens
        setAuthToken(refreshData.data.accessToken);
        localStorage.setItem("refreshToken", refreshData.data.refreshToken);
        
        // Retry original request with new token
        return apiRequest<T>(endpoint, options);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  }

  // If refresh fails, logout
  logout();
  window.location.href = "/login";
}
```

### Logout Implementation

Update `src/lib/auth.ts`:

```typescript
// Clear auth token cookie and all auth-related storage
export function logout() {
  if (typeof document === "undefined") return;
  
  // Expire the auth cookie
  document.cookie = "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  
  try {
    // Clear all auth-related storage
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("pendingVerificationEmail");
    sessionStorage.removeItem("resetPasswordEmail");
    
    // Optional: clear app state
    localStorage.removeItem("mash-wishlist");
    localStorage.removeItem("cart");
  } catch {
    // ignore storage errors
  }
}
```

---

## Frontend Integration

### Complete API Service

Create `src/lib/api/auth.ts`:

```typescript
import { apiRequest } from "../api-client";
import { setAuthToken, logout } from "../auth";

// Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendCodeRequest {
  email: string;
}

// Auth API Service
export const AuthApi = {
  // Register new user
  register: async (data: RegisterRequest) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Verify email with 6-digit code
  verifyEmailCode: async (data: VerifyCodeRequest) => {
    const response = await apiRequest<any>("/auth/verify-email-code", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    // Store token
    if (response.data?.token) {
      setAuthToken(response.data.token, true);
    }
    
    return response;
  },

  // Resend verification code
  resendVerificationCode: async (data: ResendCodeRequest) => {
    return apiRequest("/auth/resend-verification-code", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Login with email and password
  login: async (data: LoginRequest) => {
    const response = await apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    // Store tokens
    const accessToken = response.data?.accessToken || response.accessToken;
    const refreshToken = response.data?.refreshToken || response.refreshToken;
    
    if (accessToken) {
      setAuthToken(accessToken, true);
    }
    
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    
    return response;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest) => {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Logout
  logout: () => {
    logout();
  },
};
```

### Using the Auth API

In your components:

```typescript
import { AuthApi } from "@/lib/api/auth";

// Registration
const handleRegister = async (data) => {
  const response = await AuthApi.register(data);
  // Handle response
};

// Verification
const handleVerify = async (email, code) => {
  const response = await AuthApi.verifyEmailCode({ email, code });
  // Redirect to onboarding
};

// Login
const handleLogin = async (email, password) => {
  const response = await AuthApi.login({ email, password });
  // Redirect to shop
};

// Logout
const handleLogout = () => {
  AuthApi.logout();
  router.push("/");
};
```

---

## Testing & Troubleshooting

### Testing with cURL

#### 1. Test Registration
```bash
curl -X POST https://mash-backend-api-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### 2. Test Email Verification
```bash
curl -X POST https://mash-backend-api-production.up.railway.app/api/v1/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

#### 3. Test Login
```bash
curl -X POST https://mash-backend-api-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### 4. Test Forgot Password
```bash
curl -X POST https://mash-backend-api-production.up.railway.app/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Common Issues & Solutions

#### Issue 1: CORS Errors
**Problem**: `NetworkError when attempting to fetch resource`

**Solution**: Backend must allow `http://localhost:3000` origin
```typescript
// Backend CORS configuration
app.enableCors({
  origin: ['http://localhost:3000', 'https://your-production-domain.com'],
  credentials: true,
});
```

#### Issue 2: 401 Unauthorized
**Problem**: Token expired or invalid

**Solution**: Implement automatic token refresh in API client (see Token Management section)

#### Issue 3: Email Not Received
**Problem**: User doesn't receive verification email

**Solution**:
1. Check backend email service configuration
2. Check spam folder
3. Use resend verification code endpoint
4. Verify email service (SendGrid, AWS SES) is working

#### Issue 4: Rate Limiting
**Problem**: 429 Too Many Requests

**Solution**:
- Wait for rate limit reset (check `X-RateLimit-Reset` header)
- Implement exponential backoff retry logic
- Rate limits: 20 requests per minute per endpoint

#### Issue 5: Code Expired
**Problem**: Verification code expired (10 minutes)

**Solution**: Use resend verification code endpoint to get new code

### Debugging Tips

**Enable API Logging**:
```typescript
// In src/lib/api-client.ts
if (process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === "true") {
  console.log("API Request:", {
    url,
    method: options.method,
    headers,
    body: options.body,
  });
  console.log("API Response:", response.status, data);
}
```

**Check Network Tab**:
1. Open browser DevTools
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Inspect request/response headers and body

**Verify Token Storage**:
```typescript
// Check if token is stored
console.log("Auth Token:", document.cookie);
console.log("Refresh Token:", localStorage.getItem("refreshToken"));
```

---

## Complete Implementation Checklist

### Frontend Tasks
- [x] Update `.env.local` with production API URL
- [ ] Update `src/lib/api-client.ts` with token refresh logic
- [ ] Update `src/app/(auth)/signup/page.tsx` for registration
- [ ] Update `src/app/(auth)/verify-otp/page.tsx` for 6-digit code
- [ ] Update `src/app/(auth)/login/page.tsx` for login
- [ ] Update `src/app/(auth)/forgot-password/page.tsx`
- [ ] Create `src/lib/api/auth.ts` service
- [ ] Test complete auth flow (register → verify → login)
- [ ] Test forgot password flow
- [ ] Test token refresh on 401 errors
- [ ] Test logout functionality

### Backend Verification
- [x] Backend API is live at Railway
- [x] `/auth/register` endpoint works
- [x] `/auth/verify-email-code` endpoint works
- [x] `/auth/resend-verification-code` endpoint works
- [x] `/auth/login` endpoint works
- [x] `/auth/forgot-password` endpoint works
- [ ] Email service configured and sending emails
- [ ] CORS configured for frontend domain
- [ ] Rate limiting configured
- [ ] JWT tokens generated correctly

### Testing
- [ ] Test registration with valid data
- [ ] Test registration with duplicate email
- [ ] Test email verification with valid code
- [ ] Test email verification with expired code
- [ ] Test email verification with invalid code
- [ ] Test resend verification code
- [ ] Test login with verified account
- [ ] Test login with unverified account
- [ ] Test login with invalid credentials
- [ ] Test forgot password flow
- [ ] Test token refresh on expiry
- [ ] Test logout and token clearing

---

## Success Criteria

✅ **Registration Working**: User can register and receive 6-digit code email  
✅ **Verification Working**: User can verify email with code and get logged in  
✅ **Login Working**: User can login with email/password and receive tokens  
✅ **Forgot Password Working**: User can request password reset code  
✅ **Token Management Working**: Access tokens auto-refresh before expiry  
✅ **Error Handling Working**: All errors show user-friendly messages  
✅ **Security Working**: Tokens stored securely, HTTPS enforced  

---

**Last Updated**: November 12, 2025  
**API Base URL**: `https://mash-backend-api-production.up.railway.app/api/v1`  
**Status**: ✅ Backend Live | ⚠️ Frontend Integration Required
