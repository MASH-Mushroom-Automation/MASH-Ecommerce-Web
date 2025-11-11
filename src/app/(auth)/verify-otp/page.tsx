"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// API Response Types
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

      // Store user data
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Clear pending email
      sessionStorage.removeItem("pendingVerificationEmail");

      // Show success message
      toast.success("Email verified!", {
        description: response.data.message || "Your account has been verified successfully.",
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
        description: response.data.message || "A new verification code has been sent to your email.",
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
      {/* Card */}
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
