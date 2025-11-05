"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4 || /\D/.test(otpCode)) {
      toast.error("Invalid code", {
        description: "Please enter the 4-digit code.",
      });
      return;
    }
    try {
      // TODO: verify OTP via API
      await new Promise((r) => setTimeout(r, 400));
      toast.success("Verified", {
        description: "Code accepted. Create a new password.",
      });
      router.push("/reset-password");
    } catch {
      toast.error("Verification failed", {
        description: "Please try again or resend a new code.",
      });
    }
  };

  const handleResend = async () => {
    try {
      // TODO: resend OTP via API
      await new Promise((r) => setTimeout(r, 300));
      toast.info("Code resent", { description: "We sent a new 4-digit code." });
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Unable to resend", {
        description: "Please wait a moment and try again.",
      });
    }
  };

  const handleCancel = () => {
    router.push("/forgot-password");
  };

  return (
    <>
      {/* Card */}
      <div className="bg-white rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#6A994E] rounded-full p-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Enter verification code
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8">
            Enter One-Time Password sent to <br />
            jos*****@gmail.com
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-4 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-2xl font-semibold border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            ))}
          </div>

          {/* Resend Code */}
          <p className="text-center text-sm text-gray-600 mb-8">
            Didn&apos;t receive any OTP code?{" "}
            <button
              onClick={handleResend}
              className="text-[#6A994E] hover:underline font-medium"
            >
              Resend Code
            </button>
          </p>

          {/* Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleVerify}
              className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 text-white py-6 rounded-lg font-semibold"
            >
              Verify
            </Button>

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full py-6 border-[#6A994E] text-[#6A994E] hover:bg-[#6A994E]/10"
            >
              Cancel
            </Button>
          </div>
        </div>
    </>
  );
}
